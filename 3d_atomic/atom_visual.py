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
from scipy.spatial import Delaunay
from scipy.interpolate import interpn
from fractions import Fraction
from jsonschema import validate

import data

my_data = edict.LazyLoad(get_module_path(data))
_default_atom_map = pd.DataFrame(my_data.atom_data_csv.to_dict())
_default_atom_map = _default_atom_map.apply(pd.to_numeric,axis=0, errors='ignore')
_default_atom_map.set_index('Number',inplace=True)
_default_atom_map.index.name = 'atomic\nnumber'

def get_atom_map():
    return _default_atom_map.copy()

def struct_to_visual(struct,name,atom_map=None):
    
    assert isinstance(struct, pym.core.structure.Structure)
    
    if atom_map is None:
        atom_map = _default_atom_map
    color = 'rgb({r},{g},{b})'
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
            sdict[key]['color'] = color.format(r=int(float(atom_map.loc[anum].Red)*255),
                                          g=int(float(atom_map.loc[anum].Green)*255),
                                          b=int(float(atom_map.loc[anum].Blue)*255))
            sdict[key]['centre'] = centre.tolist()
            sdict[key]['cell_vectors'] = {}
            sdict[key]['cell_vectors']['a'] = a.tolist()
            sdict[key]['cell_vectors']['b'] = b.tolist()
            sdict[key]['cell_vectors']['c'] = c.tolist()
            sdict[key]['coords'] = []
            #sdict[key]['visible'] = []
            #sdict[key]['transforms'] = []
            
        sdict[key]['coords'].append(pos.tolist())
        #sdict[key]['visible'].append(True)
    
    return {'elements':list(sdict.values()),'transforms':[]}
        
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
                    'required':['type'],
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

_cell_repeat_transform_schema = {
    'type':'object',
    'required':['cell_vectors','centre','coords','type'],
    'properties':{
        'type':{'type':'string','pattern':'repeat_cell'},
        'cell_vectors':{'required':['a','b','c']},
        'coords':{'type':'array'}
    }
}

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
]

def apply_transforms(vstruct):
    
    tfuncs = {'repeat_cell':
                  {'local_repeat':_repeat_repeat_cell,
                   'recentre':_recentre_repeat_cell,
                   'local_align':_align_repeat_cell,
                   'slice':_cslice_repeat_cell}}
    
    schema = _get_vstruct_schema([_cell_repeat_transform_schema],
                                 _transform_schema)
    validate(vstruct,schema)
    new_struct = copy.deepcopy(vstruct)
    transforms = new_struct.pop('transforms')
    new_struct['transforms'] = []
    
    for e in new_struct['elements']:
        for trans in transforms:
            trans = copy.deepcopy(trans)
            ttype = trans.pop('type')
            tfuncs[e['type']][ttype](e,**trans)
            
    return new_struct

def create_ivol(vstruct,
                width=500,height=400):
                
    
    new_struct = apply_transforms(vstruct)
    
    p3.clear()
    fig = p3.figure(width=width,height=height,controls=True)
    fig.screen_capture_enabled = True
    
    for element in new_struct['elements']:
        if element['type'] == 'repeat_cell':    
            x, y, z = np.array(element['coords']).T
            s = p3.scatter(x,y,z,marker='sphere',size=6,color=element['color'])        
            element['ivol'] = s
    
    # split up controls
    figbox, fullscreen = p3.gcc().children
    
    return new_struct, fig, {'view':[fullscreen]}

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
            tabs[name] = widgets.VBox(cntrls)
        options = widgets.Tab(children=tuple(tabs.values()))
        for i, name in enumerate(tabs):
            options.set_title(i, name)
        
    if top:
        return widgets.VBox([options,fig])
    else:
        return widgets.VBox([fig,options])
    
def dcube_to_visual(cube,struct,name):
    sdict = {name:{}}
    a,b,c = [_ for _ in struct.lattice.matrix]
    centre = 0.5*(a+b+c)

    sdict[name]['type'] = 'volume'
    sdict[name]['centre'] = centre.copy()
    sdict[name]['dcube'] = cube.copy()
    sdict[name]['cell_vectors'] = {}
    sdict[name]['cell_vectors']['a'] = a.copy()
    sdict[name]['cell_vectors']['b'] = b.copy()
    sdict[name]['cell_vectors']['c'] = c.copy() 
    sdict[name]['slices'] = []
    return sdict

def _repeat_cell_volume(vstruct,vector='a',rep=1,
                newcentre=True):    
    assert vstruct['type'] == 'volume'
    reps = OrderedDict([('a',1),('b',1),('c',1)])
    reps[vector] += abs(rep)
    vstruct['dcube'] = np.tile(vstruct['dcube'],
                               list(reps.values()))
    
    repv = vstruct['cell_vectors'][vector]
    vstruct['cell_vectors'][vector] = repv * (abs(rep)+1)
    
    if newcentre:
        vstruct['centre'] = 0.5*(vstruct['cell_vectors']['a']
                                +vstruct['cell_vectors']['b']
                                +vstruct['cell_vectors']['c'])

def _recentre_volume(vstruct,centre=(0.,0.,0.)):
    assert vstruct['type'] == 'volume'
    vstruct['centre'] = np.asarray(centre,dtype=float)   

def _align_volume(vstruct,vector='a',direction=(1,0,0)):
    """align cell vector to a cartesian direction"""
    assert vstruct['type'] == 'volume'
    direction=np.asarray(direction,dtype=float)
    v = vstruct['cell_vectors'][vector]
    new_cell = _realign_vectors([vstruct['cell_vectors']['a'],
                                 vstruct['cell_vectors']['b'],
                                 vstruct['cell_vectors']['c']],
                                 v,direction)
    vstruct['cell_vectors']['a'] = new_cell[0]
    vstruct['cell_vectors']['b'] = new_cell[1]
    vstruct['cell_vectors']['c'] = new_cell[2]

def _cslice_volume(vstruct,normal=(1,0,0),lbound=None,ubound=None,
          centre=None):
    assert vstruct['type'] == 'volume'
    normal=np.asarray(normal,dtype=float)
    vstruct['slices'].append((
        normal,lbound,ubound,centre)) 

class GeometryManipulationWithVol(object):
    _manip_dict = {
        'scatter':{'repeat_cell':_repeat_repeat_cell,
                   'recentre':_recentre_repeat_cell,
                   'align':_align_repeat_cell,
                   'cslice':_cslice_repeat_cell},
        'volume':{'repeat_cell':_repeat_cell_volume,
                   'recentre':_recentre_volume,
                   'align':_align_volume,
                   'cslice':_cslice_volume}
    }
    def align(self,*args,**kwargs):
        raise NotImplementedError(
            'rotating cell vectors currently not working for volumes')        
            
from scipy.spatial import Delaunay
from scipy.interpolate import interpn

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

def _slice_cube(cube,minb,maxb,
               normal,lbound=None,ubound=None,
               origin=(0.,0.,0.)):
    tr = (2,0,1)
    cubet = cube.transpose(tr)
    xdim,ydim,zdim = cubet.shape

    x,y,z = np.meshgrid(np.arange(0,xdim),np.arange(0,ydim),np.arange(0,zdim))
    indices = np.array((x.flatten(),y.flatten(),z.flatten())).T
    coords = np.divide(indices,np.array((xdim-1,ydim-1,zdim-1)))
    coords = coords * (np.abs(maxb-minb)) + minb

    mask = _slice_mask(coords,normal,lbound,ubound,origin)
    mask = mask.reshape(cubet.shape)
    cubet[~mask] = np.nan
    return cubet.transpose(tr)

def create_ivol_withvol(vstructs,
                width=500,height=400,
                max_dim=100,
                controls=True,
                **volargs):
    
    # ensure there is only one volume
    voltypes = edict.filter_keyvals(vstructs,[('type','volume')]) 
    assert len(voltypes)<=1, "there can only be one volume rendering per scene"

    p3.clear()
    fig = p3.figure(width=width,height=height,controls=controls)
    fig.screen_capture_enabled = True

    if voltypes:
        volstruct = vstructs[list(voltypes.keys())[0]]
        a = volstruct['cell_vectors']['a']
        b = volstruct['cell_vectors']['b']
        c = volstruct['cell_vectors']['c']
        
        # convert dcube to cartesian
        out = _cartesian_basis3d(volstruct['dcube'],a,b,c,
                                volstruct['centre'],
                                max_dim=max_dim)
        new_density, minb, maxb = out
        for norm,lbound,ubound,centre in volstruct['slices']:
            new_density = _slice_cube(
                new_density,minb,maxb,
                norm,lbound,ubound,
                volstruct['centre'] if centre is None else centre)

        vol = p3.volshow(new_density,**volargs,)
        volstruct['ivol'] = vol
        
        # appropriately scale axis
        xmin,ymin,zmin = minb
        xmax,ymax,zmax = maxb
        p3.xlim(xmin,xmax)
        p3.ylim(ymin,ymax)
        p3.zlim(zmin,zmax)    
    
    for vstruct in vstructs.values():
        if vstruct['type'] == 'scatter':    
            coords = np.array(vstruct['coords'])[vstruct['visible']]
            x, y, z = coords.T
            s = p3.scatter(x,y,z,marker='sphere',size=3,color=vstruct['color'])        
            vstruct['ivol'] = s
    
    # split up controls
    if voltypes:
        (level_ctrls, figbox, fullscreen, 
         extractrl1,extractrl2) = p3.gcc().children
        controls = OrderedDict([('transfer function',[level_ctrls]),
                    ('lighting',[extractrl1,extractrl2]),
                    ('view',[fullscreen])])
    else:
        figbox, fullscreen = p3.gcc().children    
        controls = {'view':[fullscreen]}
    
    return fig, controls
    
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

def plot_atoms_top(structs,color_depth=None,
               axis_range=None,
               ax=None, legend=None,
               show_legend=True):
    """plot atoms and bounding boxes as top-down orthographic image,
    with atoms color lightened with decreasing z coordinate
    
    Parameters
    ----------
    structs : dict
    color_depth: float
        z-depth at which colors are completely lightened 
    zrotation : float
        rotate about z-axis
    axis_range : tuple
        (xmin,xmax,ymin,ymax)
               
    """

    if ax is None:
        fig = plt.figure()
        # initialize axis, important: set the aspect ratio to equal
        ax = fig.add_subplot(111, aspect='equal')
    legend = {} if legend is None else legend
    default_axis_range = None

    # filter scatter type 
    skeys = edict.filter_keyvals(structs,[('type','scatter')]).keys()
    scatters = {k:structs[k] for k in skeys}

    # create list of atoms
    flatten = lambda l: [item for sublist in l for item in sublist]
    items =   [len(v['coords']) for v in scatters.values()]
    coords = flatten([v['coords'] for v in scatters.values()])
    df = pd.DataFrame({
    'x':[v[0] for v in coords],
    'y':[v[1] for v in coords],
    'z':[v[2] for v in coords],
    'visible':flatten([v['visible'] for v in scatters.values()]),
    'radius':flatten([[v['radius']]*i for i,v in zip(items,scatters.values())]),
    'transparency':flatten([[v['transparency']]*i for i,v in zip(items,scatters.values())]),
    'color':flatten([[v['color']]*i for i,v in zip(items,scatters.values())])
    })
    df = df[df.visible]
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
        for name, scatter in scatters.items():
            color = _color_to_rgb(scatter['color'])
            label = name.replace('_',' ')
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