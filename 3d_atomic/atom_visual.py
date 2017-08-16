#!/usr/bin/env python


import warnings
import copy
#warnings.filterwarnings("ignore")
from ipypublish.scripts.ipynb_latex_setup import *
from IPython.display import display, Image, IFrame
import pymatgen as pym
import ipywidgets as widgets
import ipyvolume as ivol
import ipyvolume.pylab as p3
from jsonextended import edict, plugins
from jsonextended.utils import get_module_path
plugins.load_builtin_plugins()
from collections import OrderedDict
from scipy.spatial import Delaunay, ConvexHull
from scipy.interpolate import interpn
from scipy.ndimage import zoom as ndzoom
from scipy.spatial import cKDTree
from fractions import Fraction
from jsonschema import validators, Draft4Validator, FormatChecker
from jsonschema.exceptions import ValidationError
import matplotlib as mpl
import numpy as np

import data

# add some validators for n-dimensional data
# an example of custom validators: https://lat.sk/2017/03/custom-json-schema-type-validator-format-python/
def nddim_validator(validator, value, instance, schema):
    dim = len(np.asarray(instance).shape)
    if value != dim:
        yield ValidationError(
            "object is of dimension {} not {}".format(dim, value))
def ndtype_validator(validator, value, instance, schema):
    try:
        np.asarray(instance,dtype=value)
    except (ValueError, TypeError):
        yield ValidationError(
            "object cannot be coerced to type %s" % value)
validator = validators.extend(
    Draft4Validator,
    validators={
        'nddim': nddim_validator,
        'ndtype':ndtype_validator})

my_data = edict.LazyLoad(get_module_path(data))
_default_atom_map = pd.DataFrame(my_data.atom_data_csv.to_dict())
_default_atom_map = _default_atom_map.apply(pd.to_numeric,axis=0, errors='ignore')
_default_atom_map.set_index('Number',inplace=True)
_default_atom_map.index.name = ''

def _get_vstruct_schema(eschemas=None,tschemas=None):
    eschemas = [{}] if eschemas is None else eschemas
    tschemas = [{}] if tschemas is None else tschemas
    vstruct_schema = {
        'type':'object',
        'required':['elements','transforms'],
        'properties':{
            'elements':{
                'type':'array',
                'items':{
                    'type':'object',
                    'required':['type','transforms'],
                    'properties':{
                        'transforms':{'type':'array'},
                    },
                    'oneOf':eschemas
                },
                
            },
            'transforms':{
                'type':'array',
                'items':{
                    'type':'object',
                    'required':['type'],
                    'oneOf':tschemas
                },
                
            }
        }
    }
    
    return vstruct_schema

_element_schema = [
   {
    'type':'object',
    'required':['cell_vectors','centre','coords','type',
                'radius','color'],
    'properties':{
        'type':{'type':'string','pattern':'repeat_cell'},
        'cell_vectors':{'required':['a','b','c']},
        'coords':{'type':'array'}
        }
  },
   {
    'type':'object',
    'required':['cell_vectors','centre','polys','type',
                'color'],
    'properties':{
        'type':{'type':'string','pattern':'repeat_poly'},
        'cell_vectors':{'required':['a','b','c']},
        'polys':{'type':'array'}
        }
  },
   {
    'type':'object',
    'required':['cell_vectors','centre','dcube','type'],
    'properties':{
        'type':{'type':'string','pattern':'repeat_density'},
        'cell_vectors':{'required':['a','b','c']},
        'dcube':{'nddim':3,'ndtype':'float'}
        }
  },
]

_transform_schema = [
    {
    'type':'object',
    'required':['cvector','rep','type'],
    'properties':{
        'type':{'type':'string','pattern':'local_repeat'},
        }        
    },
    {
    'type':'object',
    'required':['cvector','direction','type'],
    'properties':{
        'type':{'type':'string','pattern':'local_align'},
        }        
    },
    {
    'type':'object',
    'required':['centre','type'],
    'properties':{
        'type':{'type':'string','pattern':'recentre'},
        }        
    },
    {
    'type':'object',
    'required':['type','centre','normal','lbound','ubound'],
    'properties':{
        'type':{'type':'string','pattern':'slice'},
        }        
    },
    {
    'type':'object',
    'required':['type','sfraction'],
    'properties':{
        'type':{'type':'string','pattern':'resize'},
        'sfraction':{'type':'number'}
        }        
    },
]

def get_atom_map():
    return _default_atom_map.copy()

def struct_to_visual(struct,name,atom_map=None):
    
    assert isinstance(struct, pym.core.structure.Structure)
    
    if atom_map is None:
        atom_map = _default_atom_map
    #color = 'rgb({r},{g},{b})'
    a,b,c = [_ for _ in struct.lattice.matrix]
    centre = 0.5*(a+b+c)
    
    sdict = {}
    for anum, pos in zip(struct.atomic_numbers,struct.cart_coords):
        key = atom_map.loc[anum].Symbol
        if key not in sdict:
            sdict[key] = {}
            sdict[key]['type'] = 'repeat_cell'
            sdict[key]['sname'] = name                        
            sdict[key]['label'] = atom_map.loc[anum].Symbol            
            sdict[key]['radius'] = atom_map.loc[anum].RCov    
            sdict[key]['transparency'] = 1.0
            sdict[key]['color'] = mpl.colors.to_hex((
             atom_map.loc[anum].Red, atom_map.loc[anum].Green,
             atom_map.loc[anum].Blue))
            sdict[key]['centre'] = centre.tolist()
            sdict[key]['cell_vectors'] = {}
            sdict[key]['cell_vectors']['a'] = a.tolist()
            sdict[key]['cell_vectors']['b'] = b.tolist()
            sdict[key]['cell_vectors']['c'] = c.tolist()
            sdict[key]['coords'] = []
            sdict[key]['transforms'] = []
            
        sdict[key]['coords'].append(pos.tolist())
    
    return {'elements':list(sdict.values()),'transforms':[]}
        
def coord_to_visual(main, coordinating,
            max_coord=99,min_dist=.1,max_dist=3.):
    """ create polygons from atomic coordination
    
    main: dict
        repeat_cell element
    coordinating: dict
        repeat_cell element
    max_coord: int
        maximum coordination
    min_dist: float
        minimum distance to be considered
    max_dist: float
        maximum distance to be considered
        
    """
    
    # create coordinating lattice 
    # that will be larger than main lattice
    icoords = np.array(coordinating['coords'])
    a = np.array(coordinating['cell_vectors']['a'])
    b = np.array(coordinating['cell_vectors']['b'])
    c = np.array(coordinating['cell_vectors']['c'])
    coords = np.concatenate((
        icoords - a, icoords, icoords + a))
    coords = np.concatenate((
        coords - b, coords, coords + b))
    coords = np.concatenate((
        coords - c, coords, coords + c))

    ltree = cKDTree(coords)
    all_dists, all_ids = ltree.query(
        np.array(main['coords']),k=max_coord,
        distance_upper_bound=max_dist)
    masks = np.logical_and(all_dists>min_dist, all_dists<np.inf)
    polys = [coords[ids[mask]].tolist() for ids, mask in zip(all_ids, masks)]

    sdict = {}
    sdict['type'] = 'repeat_poly'
    sdict['transforms'] = []
    for var in ['sname','color','centre','transparency']:
        sdict[var] = copy.deepcopy(main[var])
    sdict['polys'] = polys
    sdict['label'] = main['label']+' (by {})'.format(coordinating['label'])
    sdict['cell_vectors'] = {}
    for cvec in ['a','b','c']:
        vector = copy.deepcopy(main['cell_vectors'][cvec])
        sdict['cell_vectors'][cvec] = vector
    return sdict
    
def dcube_to_visual(cube,struct,sname,label):
    sdict = {}
    a,b,c = [_ for _ in struct.lattice.matrix]
    centre = 0.5*(a+b+c)

    sdict['type'] = 'repeat_density'
    sdict['sname'] = sname
    sdict['label'] = label
    sdict['centre'] = centre.tolist()
    sdict['dcube'] = cube.copy()
    sdict['cell_vectors'] = {}
    sdict['cell_vectors']['a'] = a.tolist()
    sdict['cell_vectors']['b'] = b.tolist()
    sdict['cell_vectors']['c'] = c.tolist() 
    sdict['transforms'] = []
    return {'elements':[sdict],'transforms':[]}

def add_transform_repeat(vstruct,vector='a',rep=1,
                        recentre=True):
    """repeat all elements by their local centre and cell vectors
    vector : ['a','b','c']
    rep : int
    recentre: bool
        if True, move centre by 0.5 * rep * vector
    """
    vstruct['transforms'].append({
        'type':'local_repeat',
        'cvector':vector,
        'rep':rep,
        'recentre':recentre})

def add_transform_recentre(vstruct,centre=(0.,0.,0.)):
    """recentre all elements
    centre : (x,y,z)
    """
    vstruct['transforms'].append({
        'type':'recentre',
        'centre':centre})

def add_transform_align(vstruct,
                vector='a',direction=(1,0,0)):
    """align all elements (locally) in a cartesian direction
    vector : ['a','b','c']
    direction : (x,y,z)
    """
    vstruct['transforms'].append({
        'type':'local_align',
        'cvector':vector,
        'direction':direction})

def add_transform_resize(vstruct,sfraction=1.):
    """resize data array
    for example array of shape (16,16,16) with sfraction 0.5
    -> shape (8,8,8)
                
    sfraction : float
        resize data by fraction
    """
    vstruct['transforms'].append({
        'type':'resize',
        'sfraction':sfraction})

def add_transform_slice(vstruct,
            normal=(1,0,0),lbound=None,ubound=None,
            centre=None):
    """slice all elements 
    norma : array((3,))
        the vector normal to the slice planes
    ubound : None or float
        the fractional length (+/-) along the vector to create the upper slice plane
        if None, no upper bound
    lbound : None or float
        the fractional length (+/-) along the vector to create the lower slice plane
        if None, no lower bound
    origin : array((3,))
        the origin of the vector,
        if None, use local centre
    """
    vstruct['transforms'].append({
        'type':'slice',
        'normal':normal,
        'lbound':lbound,
        'ubound':ubound,
        'centre':centre})

def _repeat_repeat_cell(vstruct,cvector='a',rep=1,
                        recentre=True):
    init_coords = vstruct['coords'][:]
    repv = np.asarray(vstruct['cell_vectors'][cvector],dtype=float)
    newvector = repv * (abs(rep)+1)
    vstruct['cell_vectors'][cvector] = newvector.tolist()
    
    if recentre:
        centre = np.asarray(vstruct['centre']) 
        centre = centre + repv * (abs(rep))/2.
        vstruct['centre'] = centre.tolist()
    
    for r in range(abs(rep)):
        v = -repv*(r+1) if rep<0 else repv*(r+1)
        new_coords = []
        for c in init_coords:
            new_c = np.array(c,dtype=float)+v
            new_coords.append(new_c.tolist())
        vstruct['coords'] += new_coords 

def _recentre_repeat_cell(vstruct,centre=(0.,0.,0.)):
    centre=np.asarray(centre,dtype=float)
    tr = centre - np.asarray(vstruct['centre'],dtype=float)
    vstruct['centre'] = centre.tolist()
    new_coords = []
    for c in vstruct['coords']:
        new_c = np.array(c,dtype=float)+tr
        new_coords.append(new_c.tolist())
    vstruct['coords'] = new_coords 
    
def _realign_vectors(vectors,v1,v2):
    """
    vectors : np.array((N,3))
    v1 : np.array((3,))
    v2 : np.array((3,))
    
    Examples
    --------
    >>> _realign_vectors(
    ...      [[1,0,0],[0,1,0],[0,0,1]],
    ...      [1,0,0],[0,1,0])
    ...
    array([[ 0.,  1.,  0.],
           [-1.,  0.,  0.],
           [ 0.,  0.,  1.]])
    
    """    
    # Normalize vector length
    i_v_norm = v1 / np.linalg.norm(v1)
    f_v_norm = v2 / np.linalg.norm(v2)
    # Get axis
    uvw = np.cross(i_v_norm, f_v_norm)
    # compute trig values - no need to go through arccos and back
    rcos = np.dot(i_v_norm, f_v_norm)
    rsin = np.linalg.norm(uvw)
    #normalize and unpack axis
    if not np.isclose(rsin, 0):
        uvw /= rsin
    u, v, w = uvw
    # Compute rotation matrix
    R = (
        rcos * np.eye(3) +
        rsin * np.array([
            [ 0,  w, -v],
            [-w,  0,  u],
            [ v, -u,  0]]) +
        (1.0 - rcos) * uvw[:,None] * uvw[None,:])
    return np.einsum('...jk,...k->...j',R.T,vectors)    

def _align_repeat_cell(vstruct,cvector='a',direction=(1,0,0)):
    """align cell vector to a cartesian direction"""
    direction=np.asarray(direction,dtype=float)
    v = vstruct['cell_vectors'][cvector]
    coords = np.array(vstruct['coords'])
    new_coords = _realign_vectors(coords,v,direction)
    vstruct['coords'] = new_coords.tolist()
    new_cell = _realign_vectors([vstruct['cell_vectors']['a'],
                                 vstruct['cell_vectors']['b'],
                                 vstruct['cell_vectors']['c'],
                                 vstruct['centre']],
                                 v,direction)
    vstruct['cell_vectors']['a'] = new_cell[0].tolist()
    vstruct['cell_vectors']['b'] = new_cell[1].tolist()
    vstruct['cell_vectors']['c'] = new_cell[2].tolist()
    vstruct['centre'] = new_cell[3].tolist()
    
def _slice_mask(points, vector, 
               lbound=None,ubound=None, 
               origin=(0,0,0),
               current=None):
    """compute mask for points within the lower and upper planes
    
    Properties
    ----------
    points : array((N,3))
    vector : array((3,))
        the vector normal to the slice planes
    ubound : None or float
        the fractional length (+/-) along the vector to create the upper slice plane
    lbound : None or float
        the fractional length (+/-) along the vector to create the lower slice plane
    origin : array((3,))
        the origin of the vector
        
    Examples
    --------
    >>> points = [[0,0,-5],[0,0,0],[0,0,5]]
    >>> slice_mask(points,[0,0,1],ubound=1)
    array([ True,  True, False], dtype=bool)
    
    >>> slice_mask(points,[0,0,1],lbound=1)
    array([False, False,  True], dtype=bool)
    
    >>> slice_mask(points,[0,0,1],lbound=-1,ubound=1)
    array([False,  True, False], dtype=bool)
    
    >>> slice_mask(points,[0,0,1],lbound=1,origin=[0,0,2])
    array([False, False,  True], dtype=bool)
    
    """
    if current is None:
        mask = np.array([True for _ in points])
    else:
        mask = np.array(current)

    if ubound is not None:
        cpoints = np.array(points) - np.array(origin) - np.array(vector) * ubound
        mask = mask & (np.einsum('j,ij->i',vector,cpoints) <=0)
    if lbound is not None:
        cpoints = np.array(points) - np.array(origin) - np.array(vector) * lbound
        mask = mask & (np.einsum('j,ij->i',vector,cpoints) >=0)

    return mask   

def _cslice_repeat_cell(vstruct,normal=(1,0,0),lbound=None,ubound=None,
          centre=None):
    normal=np.asarray(normal,dtype=float)
    centre = vstruct['centre'] if centre is None else centre
    mask = _slice_mask(vstruct['coords'],
                    normal,lbound,ubound,
                    centre)
    vstruct['coords'] = np.asarray(vstruct['coords'])[mask].tolist()                    

def _repeat_repeat_poly(vstruct,cvector='a',rep=1,
                        recentre=True):
    init_polys = copy.deepcopy(vstruct['polys'])
    repv = np.asarray(vstruct['cell_vectors'][cvector],dtype=float)
    newvector = repv * (abs(rep)+1)
    vstruct['cell_vectors'][cvector] = newvector.tolist()
    
    if recentre:
        centre = np.asarray(vstruct['centre']) 
        centre = centre + repv * (abs(rep))/2.
        vstruct['centre'] = centre.tolist()
    
    for r in range(abs(rep)):
        v = -repv*(r+1) if rep<0 else repv*(r+1)
        new_polys = []
        for p in init_polys:
            new_coords = []
            for c in p:
                new_c = np.array(c,dtype=float)+v
                new_coords.append(new_c.tolist())
            new_polys.append(new_coords)
        vstruct['polys'] += new_polys 

def _recentre_repeat_poly(vstruct,centre=(0.,0.,0.)):
    centre=np.asarray(centre,dtype=float)
    tr = centre - np.asarray(vstruct['centre'],dtype=float)
    vstruct['centre'] = centre.tolist()
    init_polys = copy.deepcopy(vstruct['polys'])
    
    new_polys = []
    for p in init_polys:
        new_coords = []
        for c in p:
            new_c = np.array(c,dtype=float)+tr
            new_coords.append(new_c.tolist())
        new_polys.append(new_coords)
    vstruct['polys'] = new_polys 

def _align_repeat_poly(vstruct,cvector='a',direction=(1,0,0)):
    """align poly vectors to a cartesian direction"""
    direction=np.asarray(direction,dtype=float)
    v = vstruct['cell_vectors'][cvector]
    
    new_polys = []
    for coords in vstruct['polys']:
        new_coords = np.array(coords)
        new_polys.append(_realign_vectors(new_coords,v,direction).tolist())        
    vstruct['polys'] = new_polys
    
    new_cell = _realign_vectors([vstruct['cell_vectors']['a'],
                                 vstruct['cell_vectors']['b'],
                                 vstruct['cell_vectors']['c'],
                                 vstruct['centre']],
                                 v,direction)
    vstruct['cell_vectors']['a'] = new_cell[0].tolist()
    vstruct['cell_vectors']['b'] = new_cell[1].tolist()
    vstruct['cell_vectors']['c'] = new_cell[2].tolist()
    vstruct['centre'] = new_cell[3].tolist()

def _cslice_repeat_poly(vstruct,normal=(1,0,0),
        lbound=None,ubound=None,centre=None):
    normal=np.asarray(normal,dtype=float)
    centre = vstruct['centre'] if centre is None else centre

    pcentres = [np.mean(c,axis=0) for c in vstruct['polys']]
    mask = _slice_mask(pcentres,
                    normal,lbound,ubound,
                    centre)
    vstruct['polys'] = np.asarray(vstruct['polys'])[mask].tolist()

def _repeat_repeat_density(vstruct,cvector='a',rep=1,
                recentre=True):    
    reps = OrderedDict([('a',1),('b',1),('c',1)])
    reps[cvector] += abs(rep)
    vstruct['dcube'] = np.tile(vstruct['dcube'],
                               list(reps.values()))

    a = np.array(vstruct['cell_vectors']['a'],dtype=float)
    b = np.array(vstruct['cell_vectors']['b'],dtype=float)
    c = np.array(vstruct['cell_vectors']['c'],dtype=float)
    vecs = OrderedDict([('a',a),('b',b),('c',c)])
        
    repv = vecs[cvector] * (abs(rep)+1)
    vstruct['cell_vectors'][cvector] = repv.tolist()
    
    if recentre:
        centre = 0.5*(a+b+c)
        vstruct['centre'] = centre.tolist()
    
def _resize_repeat_density(vstruct,sfraction):
    vstruct['dcube'] = ndzoom(vstruct['dcube'],sfraction)
    
def _recentre_repeat_density(vstruct,centre=(0.,0.,0.)):
    vstruct['centre'] = np.asarray(centre,dtype=float).tolist()   

def _cslice_repeat_density(dstruct,
               normal,lbound=None,ubound=None,
               centre=None):
    """
    Examples
    --------
    >>> from pprint import pprint
    >>> dstruct = {
    ...  'dcube':np.ones((3,3,3)),
    ...  'centre':[0.,0.,0.],
    ...  'cell_vectors':{
    ...      'a':[1,0,0],
    ...      'b':[0,1,0],
    ...      'c':[0,0,1]}
    ... }
    >>> normal = np.array((0.,0.,1.))
    >>> ubound=0.25
    >>> _cslice_repeat_density(
    ...     dstruct,normal,ubound=ubound)
    >>> pprint(dstruct)
    {'cell_vectors': {'a': [1, 0, 0], 'b': [0, 1, 0], 'c': [0, 0, 1]},
     'centre': [0.0, 0.0, 0.0],
     'dcube': array([[[  1.,   1.,   1.],
             [  1.,   1.,   1.],
             [  1.,   1.,   1.]],

            [[  1.,   1.,   1.],
             [  1.,   1.,   1.],
             [  1.,   1.,   1.]],

            [[ nan,  nan,  nan],
             [ nan,  nan,  nan],
             [ nan,  nan,  nan]]])}
    """
    normal=np.asarray(normal,dtype=float)
    centre = dstruct['centre'] if centre is None else centre
    a = np.array(dstruct['cell_vectors']['a'],dtype=float)
    b = np.array(dstruct['cell_vectors']['b'],dtype=float)
    c = np.array(dstruct['cell_vectors']['c'],dtype=float)    
    
    tr = (2,0,1)
    cubet = dstruct['dcube'].transpose(tr)
    ldim,mdim,ndim = cubet.shape

    l,m,n = np.meshgrid(np.arange(0,ldim),np.arange(0,mdim),np.arange(0,ndim))
    l = l.reshape((l.shape[0]*l.shape[1]*l.shape[2],))
    m = m.reshape((m.shape[0]*m.shape[1]*m.shape[2],))
    n = n.reshape((n.shape[0]*n.shape[1]*n.shape[2],))
    indices = np.array((l,m,n)).T
        
    #fcoords = np.divide(indices,np.array((ldim-1,mdim-1,ndim-1)))
    coords = np.einsum('...jk,...k->...j',np.array([a,b,c]).T,
                       np.divide(indices,np.array((ldim-1,mdim-1,ndim-1)))
                      ) - (a+b+c)/2
        
    mask = _slice_mask(coords,normal,lbound,ubound)
    mask = mask.reshape(cubet.shape)
    cubet[~mask] = np.nan
    dstruct['dcube'] = cubet.transpose(tr)

def apply_transforms(vstruct):
    
    tfuncs = {
            'repeat_cell':{
               'local_repeat':_repeat_repeat_cell,
               'recentre':_recentre_repeat_cell,
               'local_align':_align_repeat_cell,
               'slice':_cslice_repeat_cell
           },
            'repeat_poly':{
               'local_repeat':_repeat_repeat_poly,
               'recentre':_recentre_repeat_poly,
               'local_align':_align_repeat_poly,
               'slice':_cslice_repeat_poly
           },
           'repeat_density':{
               'local_repeat':_repeat_repeat_density,
               'recentre':_recentre_repeat_density,                   
               'slice':_cslice_repeat_density,
               'resize':_resize_repeat_density,
           }           
         }
    
    schema = _get_vstruct_schema(_element_schema,
                                 _transform_schema)
    validator(schema).validate(vstruct)
    
    new_struct = copy.deepcopy(vstruct)
    gtransforms = new_struct.pop('transforms')
    new_struct['transforms'] = []
    
    for e in new_struct['elements']:
        
        # apply global transforms
        for trans in gtransforms:
            trans = copy.deepcopy(trans)
            ttype = trans.pop('type')
            tset = tfuncs[e['type']]
            if ttype not in tset:
                raise ValueError(
                'a {0} transform is not available for {1}'.format(ttype,e['type']))
            tset[ttype](e,**trans)
            
        # apply local transforms
        ltransforms = e.pop('transforms')
        e['transforms'] = []
        for trans in ltransforms:
            trans = copy.deepcopy(trans)
            ttype = trans.pop('type')
            tset = tfuncs[e['type']]
            if ttype not in tset:
                raise ValueError(
                'a {0} transform is not available for {1}'.format(ttype,e['type']))
            tset[ttype](e,**trans)        
            
    return new_struct

def _cartesian_basis3d(A,v1,v2,v3,
                      centre=(0.,0.,0.),
                     max_dim=None,
                     interp='nearest'):
    """convert 3d array in basis v1,v2,v3 to cartesian basis

    Properties
    ----------
    A : array((N,M,L))
        values in original basis 
    v1 : array((3,))
    v2 : array((3,))
    v3 : array((3,))
    centre : array((3,))
    max_dim : int
        maximum axis dimension of returned cube
        if None will use the maximum dimension of A
    interp : str
        interpolation mode; 'nearest' or 'linear'

    Returns
    -------
    B : array((P,Q,R))
        where P,Q,R <= longest_side
    min_bounds : array((3,))
        xmin,ymin,zmin
    max_bounds : array((3,))
        xmax,ymax,zmax

    """   
    
    if max_dim is not None:
        longest_side = min(max(A.shape),max_dim)
    else:
        longest_side = max(A.shape)

    # assumed
    origin = [0,0,0]

    # convert to numpy arrays
    origin = np.asarray(origin)
    v1 = np.asarray(v1)
    v2 = np.asarray(v2)
    v3 = np.asarray(v3)

    # pre-compute basis transformation matrix
    M_inv = np.linalg.inv(np.transpose([v1,v2,v3]))

    # only works right if transposed before and after?
    A = np.array(A).T
    # add bounding layers for interpolation
    A = np.concatenate((np.array(A[0],ndmin=3),A,np.array(A[-1],ndmin=3)),axis=0)
    start = np.transpose(np.array(A[:,:,0],ndmin=3),axes=[1,2,0])
    end = np.transpose(np.array(A[:,:,-1],ndmin=3),axes=[1,2,0])
    A = np.concatenate((start,A,end),axis=2)
    start = np.transpose(np.array(A[:,0,:],ndmin=3),axes=[1,0,2])
    end = np.transpose(np.array(A[:,-1,:],ndmin=3),axes=[1,0,2])
    A = np.concatenate((start,A,end),axis=1)

    # create axes
    axes=[]
    for i,v in enumerate([v1,v2,v3]):
        step = 1./(A.shape[i]-2)
        ax = np.linspace(0,1+step,A.shape[i]) - step/2.
        axes.append(ax)

    # get bounding box and compute it volume and extents
    bbox_pts=np.asarray([origin,v1,v2,v3,v1+v2,v1+v3,v1+v2+v3,v2+v3])
    hull = Delaunay(bbox_pts)

    bbox_x, bbox_y, bbox_z = bbox_pts.T
    new_bounds = bbox_x.min(),bbox_x.max(),bbox_y.min(),bbox_y.max(),bbox_z.min(),bbox_z.max() #l,r,bottom,top
    min_bound, max_bound = min(bbox_x.min(),bbox_y.min(),bbox_z.min()), max(bbox_x.max(),bbox_y.max(),bbox_z.min())

    # compute new array size
    x_length = abs(new_bounds[0]-new_bounds[1])
    y_length = abs(new_bounds[2]-new_bounds[3])
    z_length = abs(new_bounds[4]-new_bounds[5])
    if x_length == max([x_length,y_length,z_length]):
        xlen = longest_side
        ylen = int(longest_side*y_length/float(x_length))
        zlen = int(longest_side*z_length/float(x_length))
    elif y_length == max([x_length,y_length,z_length]):
        ylen = longest_side
        xlen = int(longest_side*x_length/float(y_length))
        zlen = int(longest_side*z_length/float(y_length))
    else:
        zlen = longest_side
        xlen = int(longest_side*x_length/float(z_length))
        ylen = int(longest_side*y_length/float(z_length))

    # compute new array values
    new_array = np.full((xlen,ylen,zlen),np.nan)
    xidx, yidx, zidx = np.meshgrid(range(new_array.shape[0]),range(new_array.shape[1]),range(new_array.shape[2]))
    xidx=xidx.flatten()
    yidx=yidx.flatten()
    zidx=zidx.flatten()
    xyzidx = np.concatenate((np.array(xidx,ndmin=2).T,np.array(yidx,ndmin=2).T,np.array(zidx,ndmin=2).T),axis=1)
    xyz = min_bound+(xyzidx.astype(float)*abs(min_bound-max_bound)/longest_side)
    # find if point is inside bounding box 
    inside_mask = hull.find_simplex(xyz)>=0
    uvw = np.einsum('...jk,...k->...j',M_inv,xyz[inside_mask])
    new_array[xyzidx[inside_mask][:,0],xyzidx[inside_mask][:,1],xyzidx[inside_mask][:,2]] = interpn(axes,A,uvw,bounds_error=True,method=interp)
    new_array = new_array.T  
    
    xmin,xmax,ymin,ymax,zmin,zmax = new_bounds
    return (new_array, 
            np.array((xmin,ymin,zmin)) - 0.5*(v1+v2+v3) + np.array(centre), 
            np.array((xmax,ymax,zmax)) - 0.5*(v1+v2+v3) + np.array(centre))

def create_ivol(vstruct,
                width=500,height=400,
                ssize=5,
                max_dim=100,**volargs):
                
    new_struct = apply_transforms(vstruct)
    
    # ivolume currently only allows one volume rendering per plot
    #voltypes = edict.filter_keyvals(vstructs,[('type','repeat_density')]) 
    vol_index = [i for i, el in enumerate(new_struct['elements']) 
                                if el['type']=='repeat_density']
    assert len(vol_index)<=1, "ipyvolume only allows one volume rendering per scene"
    
    p3.clear()
    fig = p3.figure(width=width,height=height,controls=True)
    fig.screen_capture_enabled = True
    
    # the volume rendering must be created first, 
    # for appropriately scaled axis
    if vol_index:
        volstruct = new_struct['elements'][vol_index[0]]
        a = volstruct['cell_vectors']['a']
        b = volstruct['cell_vectors']['b']
        c = volstruct['cell_vectors']['c']
        
        # convert dcube to cartesian
        out = _cartesian_basis3d(volstruct['dcube'],a,b,c,
                                volstruct['centre'],
                                max_dim=max_dim)
        new_density, (xmin,ymin,zmin), (xmax,ymax,zmax) = out
        vol = p3.volshow(new_density,**volargs,)
        volstruct['ivol'] = vol
        
        # appropriately scale axis
        p3.xlim(xmin,xmax)
        p3.ylim(ymin,ymax)
        p3.zlim(zmin,zmax)    
    
    for element in new_struct['elements']:
        if element['type'] == 'repeat_density':
            continue    
        if element['type'] == 'repeat_cell':    
            x, y, z = np.array(element['coords']).T
            s = p3.scatter(x,y,z,marker='sphere',size=ssize*element['radius'],color=element['color'])        
            element['ivol'] = s
        if element['type'] == 'repeat_poly':  
            polys = []
            for poly in element['polys']: 
                x, y, z = np.array(poly).T 
                hull = ConvexHull(poly)
                triangles = hull.simplices.tolist()
                p = p3.plot_trisurf(x, y, z, triangles=triangles, color=element['color'])
                polys.append(p)
            element['ivol'] = polys 
    
    # split up controls
    if vol_index:
        (level_ctrls, figbox, 
         extractrl1,extractrl2) = p3.gcc().children
        controls = OrderedDict([('transfer function',[level_ctrls]),
                    ('lighting',[extractrl1,extractrl2])])
    else:
        #figbox, fullscreen = p3.gcc().children    
        figbox = p3.gcc().children
        controls = {}
    
    return new_struct, fig, controls

def create_ivol_control(vstruct,vparam,ctype,cparam='value',**ckwargs):
    """"""
    assert 'ivol' in vstruct
    ctrl = getattr(widgets,ctype)(**ckwargs)
    widgets.jslink((vstruct['ivol'], vparam), (ctrl, cparam))
    
    return ctrl

def add_controls(fig, ctrl_layout,
                top=False):
    """"""
    if not ctrl_layout:
        return fig
    if isinstance(ctrl_layout,list):
        layout = []
        for cntrl in ctrl_layout:
            if isinstance(cntrl,list):
                cntrl = widgets.HBox(cntrl)
            layout.append(cntrl)
        options = widgets.VBox(layout)
    else:
        tabs = OrderedDict()
        for name, cntrls in ctrl_layout.items():
            layout = []
            for cntrl in cntrls:
                if isinstance(cntrl,list):
                    cntrl = widgets.HBox(cntrl)
                layout.append(cntrl)
            tabs[name] = widgets.VBox(layout)
        options = widgets.Tab(children=tuple(tabs.values()))
        for i, name in enumerate(tabs):
            options.set_title(i, name)
        
    if top:
        return widgets.VBox([options,fig])
    else:
        return widgets.VBox([fig,options])
        
def _color_to_rgb(item):
    try:
        if item.startswith('rgb('):
            item = item[4:-1].split(',')
            item = tuple([float(v)/255 for v in item])
    except AttributeError:
        pass
    return mpl.colors.to_rgb(item)

def _lighter_color(color, fraction=0.1):
    """returns a lighter color

    color: (r,g,b)
    fraction: [0,1] to lighten by
    """
    if fraction == 0.:
        return color
    assert fraction>0 and fraction<=1, 'fraction must be between 0 and 1'
    white = np.array([1., 1., 1.])
    vector = white-color
    return color + vector * fraction

def plot_atoms_top(vstruct,color_depth=None,
               axis_range=None,
               ax=None, legend=None,
               show_legend=True):
    """plot atoms and bounding boxes as top-down orthographic image,
    with atoms color lightened with decreasing z coordinate
    
    Parameters
    ----------
    vstructs : dict
    color_depth: float
        z-depth at which colors are completely lightened 
    zrotation : float
        rotate about z-axis
    axis_range : tuple
        (xmin,xmax,ymin,ymax)
               
    """
    new_struct = apply_transforms(vstruct)

    if ax is None:
        fig = plt.figure()
        # initialize axis, important: set the aspect ratio to equal
        ax = fig.add_subplot(111, aspect='equal')
    legend = {} if legend is None else legend
    default_axis_range = None

    # filter repeat_cell type 
    rcell_indices = [i for i, el in enumerate(new_struct['elements']) 
                                if el['type']=='repeat_cell']
    
    
    #skeys = edict.filter_keyvals(new_struct['elements'],[('type','repeat_cell')]).keys()
    #scatters = {k:structs[k] for k in skeys}
    scatters = [new_struct['elements'][i] for i in rcell_indices]

    # create list of atoms
    flatten = lambda l: [item for sublist in l for item in sublist]
    items =   [len(v['coords']) for v in scatters]
    coords = flatten([v['coords'] for v in scatters])
    df = pd.DataFrame({
    'x':[v[0] for v in coords],
    'y':[v[1] for v in coords],
    'z':[v[2] for v in coords],
    #'visible':flatten([v['visible'] for v in scatters.values()]),
    'radius':flatten([[v['radius']]*i for i,v in zip(items,scatters)]),
    'transparency':flatten([[v['transparency']]*i for i,v in zip(items,scatters)]),
    'color':flatten([[v['color']]*i for i,v in zip(items,scatters)])
    })
    #df = df[df.visible]
    df.color = df.color.apply(_color_to_rgb)

    if color_depth is not None:
        clip = (df.z.max()-color_depth,df.z.max())
    else:
        clip = (df.z.min(),df.z.max())

    if default_axis_range is None:
        default_axis_range = [df.x.min(),df.x.max(),df.y.min(),df.y.max()]
    else:
        xmin,xmax,ymin,ymax = default_axis_range
        default_axis_range = [min(xmin,x.min()),max(xmax,x.max()),
                              min(ymin,y.min()),max(ymax,y.max())]
    sort_mask = df.z.argsort()
    z_clipped = np.clip(df.z,clip[0],clip[1])
    if z_clipped.max() == z_clipped.min():
        z_norm = np.ones_like(z_clipped)
    else:
        z_norm=(z_clipped-clip[0])/(clip[1]-clip[0])

    lbound, ubound = 0.1, 1.
    z_scaled = (z_norm * (ubound - lbound)) + lbound

    zcolor = np.array([_lighter_color(c,1-f) for c,f in zip(df.color.values, z_scaled)])

    # create 2d atoms
    for (i, row),zcolor in zip(df.iloc[sort_mask].iterrows(),zcolor[sort_mask]):
        ax.add_artist(mpl.patches.Circle(xy=(row.x, row.y),radius=row.radius,
                                         alpha=row.transparency,color=zcolor))

    if show_legend:
        for scatter in scatters:
            color = _color_to_rgb(scatter['color'])
            label = scatter['label']
            if scatter['sname']:
                label += ' ('+scatter['sname']+')'
            
            Artist = plt.Line2D((0,1),(0,0), color=color, marker='o', linestyle='')
            if label in legend:
                raise ValueError('attempting to set muliple legend keys for label: {}'.format(label))
            legend[label] = Artist

        # Shrink current axis by 20%
        box = ax.get_position()
        ax.set_position([box.x0, box.y0, box.width * 0.8, box.height])
        # Put a legend to the right of the current axis
        labels = sorted(legend.keys())
        handles = [legend[k] for k in labels]
        ax.legend(handles,labels,loc='center left', bbox_to_anchor=(1, 0.5));

    if axis_range is not None:
        xmin,xmax,ymin,ymax = axis_range
        ax.set_xbound(xmin,xmax)
        ax.set_ybound(ymin,ymax)
    else:
        xmin,xmax,ymin,ymax = default_axis_range
        ax.set_xbound(xmin,xmax)
        ax.set_ybound(ymin,ymax)
        
    return ax, legend
    
_band_maps = {
    'cubic':{
        (0,0,0):'$\Gamma$',
        (0.5,0.5,0.):'M',
        (0.5,0.5,0.5):'R',
        (0.,0.5,0):'X',
    },
    'fcc':{
        (0,0,0):'$\Gamma$',
        (0.5,0.,0.5):'X',
        (0.5,0.5,0.5):'L',
        (0.5,0.25,0.75):'W',
    },
    'bcc':{
        (0,0,0):'$\Gamma$',
        (0.5,-0.5,0.5):'H',
        (0.25,0.25,0.25):'P',
        (0.,0.,0.5):'N',
    },    
}

def plot_states(band_segments=None, doss_segments=None, 
                fermi_align=False,
                iss=1,band_map=None,dos_map=None,
                spin=False,sep_spin=False,
                majority_color='green',minority_color='red',
                width_ratio=(1,1), ebound=(None,None)):
    """
    
    Properties
    -----------
    fermi_align : bool
        if True, align energies to fermi energy
    iss : int
        shrinking/division factor in terms of which the coordinates of
        the segments are expressed.
    band_map : dict or str
        to map segment coordinates to letters
        if str, bravais lattice type, allowed;
        {lattices}
    dos_map : dict
        to map projection number to name (start at 1, total is last)
    spin : bool
        whether there are multiple spins
    sep_spin : bool
        plot majority/minority spin in separate plots
    majority_color : tuple or str
        majority spin color
    minority_color : tuple or str
        minority spin color
    width_ratio : int
        width ratio of band plot to doss plot
    ebound : tuple
        (min,max) energy initialised in plot
    
    """
    band_map = band_map if isinstance(band_map,dict) else _band_maps.get(band_map, {})
    dos_map = dos_map if isinstance(dos_map,dict) else {}

    # if band_fname is not None:
    #     band_segments = read_band(band_fname,iss)
    #
    # if doss_fname is not None:
    #     doss_segments = read_doss(doss_fname)
           
    if band_segments is not None and doss_segments is not None:
        if spin and sep_spin:
            fig, axes = plt.subplots(2,2,
                sharey=True,sharex='col',gridspec_kw={'width_ratios':width_ratio},squeeze=True)
            ax1, ax2, ax21, ax22 = axes.flatten()
        else:
            fig, axes = plt.subplots(1,2,
                sharey=True,sharex='col',gridspec_kw={'width_ratios':width_ratio})
            ax1, ax2 = axes
    elif band_segments is not None:
        if spin and sep_spin:
            fig, axes = plt.subplots(2,1,
                sharey=True,sharex='col',squeeze=True)
            ax1, ax21 = axes
        else:
            fig, axes = plt.subplots()
            ax1 = axes
    elif doss_segments is not None:
        fig, axes = plt.subplots()
        ax2 = axes
    else:
        return

    if band_segments is not None:
        xlabels = {}
        fermi_y=None
        k_start = 0
        linestyle='solid'  
        color = majority_color
        ax = ax1
        for i, seg_key in enumerate(sorted(band_segments.keys())):
            segment = band_segments[seg_key]
            eoffset = -segment['fermi'] if fermi_align else 0.
            eupper, elower = segment['erange'][0]+eoffset, segment['erange'][1]+eoffset
            k_end = k_start + segment['kspan']
            
            for energy, kspace in zip(segment['energy'],segment['kspace']):
                ax.plot(kspace+k_start, energy+eoffset,linestyle=linestyle,color=color)  
              
            # for spin polarised majority first then minority 
            if not spin or sep_spin or (spin and i+1<=len(band_segments)/2.):
                #Fraction(int(i),iss) for band iband and fband
                iband = tuple([Fraction(i,iss) for i in segment['iband']])
                fband = tuple([Fraction(i,iss) for i in segment['fband']])
                xlabels[k_start] = band_map.get(iband,','.join([str(f) for f in iband]))
                xlabels[k_end] = band_map.get(fband,','.join([str(f) for f in fband]))
                fermi_y=segment['fermi']+eoffset
                ax.plot(np.linspace(k_start,k_end), [segment['fermi']+eoffset for _ in range(50)],'b--')
                ax.plot([k_start for _ in range(50)],np.linspace(eupper, elower),'k--') 
                ax.plot([k_end  for _ in range(50)],np.linspace(eupper, elower),'k--')    

            if spin and i+1==len(band_segments)/2.:
                color = minority_color
                linestyle='dashed'  
                if sep_spin:
                    linestyle='solid'
                    ax = ax21
                k_start = 0
            else:
                k_start = k_end 
                
        baxes = [ax1] if not sep_spin or not spin else [ax1,ax21]
        for ax in baxes:
            ax.set_xticks(list(xlabels.keys()))
            ax.set_xticklabels(list(xlabels.values()),{'rotation':-25},ha='left')
            if fermi_y is not None:    
                ax.annotate('$\epsilon_f$',xy=(k_start,fermi_y),
                    xytext=(2,0),textcoords='offset pixels',color='blue')
            ax.set_ylabel('Energy (eV)')
            ax.set_xlim(0,k_start)   
            ax.set_ylim(eupper, elower)  
            ax.set_ybound(*ebound)

    if doss_segments is not None:
        fermi_y=None
        dos_offset=0
        xlabels = {}
        ax = ax2
        for i,seg_key in enumerate(sorted(doss_segments.keys())):
            segment = doss_segments[seg_key]
            eoffset = -segment['fermi'] if fermi_align else 0.
            # minority spin dos are negative 
            dos = np.abs(segment['dos'])
                        
            # for spin polarised majority first then minority
            if not spin or (spin and i+1<=len(doss_segments)/2.):
                ax.plot(dos+dos_offset,segment['energy']+eoffset,
                         color=majority_color,linestyle='solid')
                ax.fill(dos+dos_offset,segment['energy']+eoffset,
                          alpha=0.1,color=majority_color)    
                
                if i+1==len(doss_segments) or (spin and i+1==len(doss_segments)/2.):
                    pname = 'Total'
                else:
                    pname = dos_map.get(segment['iproj'],'P'+str(segment['iproj']))
                xlabels[dos_offset] = '{0} ({1} AOs)'.format(pname,segment['naos'])
                fermi_y=segment['fermi']+eoffset
            else:
                if sep_spin:
                    ax.plot(dos+dos_offset,segment['energy']+eoffset,
                             color=minority_color,linestyle='solid')
                    ax.fill(dos+dos_offset,segment['energy']+eoffset,
                             alpha=0.1,color=minority_color)                
                else:
                    ax.plot(dos+dos_offset,segment['energy']+eoffset,
                             color=minority_color,linestyle='dashed')
                    ax.fill(dos+dos_offset,segment['energy']+eoffset,
                             alpha=0.2,color=minority_color,
                            fill=False,hatch='xx',linewidth=0)                

            if spin and i+1==len(doss_segments)/2.: 
                dos_offset = 0
                if sep_spin:
                    ax = ax22
            else:
                dos_offset += max(dos)+1                
            
        daxes = [ax2] if not sep_spin or not spin else [ax2,ax22]
        for ax in daxes:
            if fermi_y is not None:
                ax.plot(np.linspace(0,dos_offset), [fermi_y for _ in range(50)],'b--')
                ax.annotate('$\epsilon_f$',xy=(dos_offset,fermi_y),
                    xytext=(2,0),textcoords='offset pixels',color='blue')
            ax.set_xlim(0,dos_offset) 
            ax.set_xticks(list(xlabels.keys()))
            rotation = -25 
            if len(doss_segments)==1 and not spin: rotation=0
            if len(doss_segments)==2 and spin: rotation=0
            ax.set_xticklabels(list(xlabels.values()),{'rotation':rotation},ha='left')
            ax.set_ybound(*ebound)

    fig.tight_layout()
    return fig, axes   

plot_states.__doc__ = plot_states.__doc__.format(lattices=list(_band_maps.keys()))