import re
from collections import OrderedDict
from jsonextended import edict, plugins
import numpy as np
import pymatgen as pym
from pymatgen.io.cif import CifParser as cifparser
plugins.load_builtin_plugins()

class CIFPlugin(object):
    """ cif parser plugin for jsonextended
    """
    plugin_name = 'crytallographic_info_file'
    plugin_descript = 'read crytallographic information files, assumes single structure per file'
    file_regex = '*.cif'
        
    def read_file(self, file_obj, **kwargs):
        cif = cifparser.from_string(file_obj.read())
        dic = cif.as_dict()
        dic = dic[list(dic.keys())[0]]
        # remove underscores for key names
        new_dic = OrderedDict()
        for key in dic.keys():
            newkey = key[1:] if key.startswith('_') else key
            new_dic[newkey] = dic[key]
        new_dic['structure'] = cif.get_structures()[0]
        
        return new_dic        
        
_match_number = re.compile('-?\ *[0-9]+\.?[0-9]*(?:[Ee]\ *[+-]?\ *[0-9]+)?')
_ihferm_map = {0:'closed shell, insulating system',
              1:'open shell, insulating system',
              2:'closed shell, conducting system',
              3:'open shell, conducting system'}
_hartree_eV = 27.2114

class BANDPlugin(object):
    """ band parser plugin for jsonextended
    """
    plugin_name = 'crystal_band'
    plugin_descript = 'read CRYSTAL band output'
    file_regex = '*.band.f25'
        
    def read_file(self, f, **kwargs):
        band_segments={}

        line = f.readline().strip()
        while line:
            if line.startswith('-%-'):
                segment={}
                segment['ihferm'] = _ihferm_map[int(line[3])]
                segment['type'] = line[4:8]

                nbands,nkpts,dummy,kdist,fermi = re.findall(_match_number, line[8:])
                nbands,nkpts,kdist = int(nbands),int(nkpts),float(kdist)
                segment['nkpts'] = nkpts
                segment['fermi'] =  float(fermi)*_hartree_eV                        
                line = f.readline().strip()
                EMIN,EMAX = [float(s) for s in re.findall(_match_number, line)]
                segment['erange'] =  (EMIN*_hartree_eV,EMAX*_hartree_eV)                                                                  
                line = f.readline().strip()
                i1,i2,i3,j1,j2,j3 = [int(i) for i in line.split()]
                segment['iband'] = (i1,i2,i3)
                segment['fband'] = (j1,j2,j3)
                line = f.readline().strip()
                energy=[]
                while not line.startswith('-%-') and line:                
                    energy+=[float(s) for s in re.findall(_match_number, line)]
                    line = f.readline().strip()
                segment['energy'] = np.array([energy[i*nbands:i*nbands+nbands] for i in range(nkpts)]).T * _hartree_eV
                segment['kspace'] = [np.linspace(0,kdist*nkpts,nkpts) for _ in range(nbands)]
                segment['kspan'] = kdist*nkpts

                band_segments['segment{:03d}'.format(len(band_segments)+1)] = segment
            else:
                line = f.readline().strip() 
        return band_segments

class DOSSPlugin(object):
    """ doss parser plugin for jsonextended
    """
    plugin_name = 'crystal_doss'
    plugin_descript = 'read CRYSTAL density of states output'
    file_regex = '*.doss.f25'
        
    def read_file(self, f, **kwargs):
        doss_segments={}

        line = f.readline().strip()
        while line:
            if line.startswith('-%-'):
                segment={}
                segment['ihferm'] = _ihferm_map[int(line[3])]
                segment['type'] = line[4:8]

                nrows,ncols,dummy,denergy,fermi = re.findall(_match_number, line[8:])
                nrows,ncols,segment['denergy'] = int(nrows),int(ncols),float(denergy)*_hartree_eV
                segment['fermi'] =  float(fermi)*_hartree_eV                        
                line = f.readline().strip()
                dummy,segment['ienergy'] = [float(s)*_hartree_eV for s in 
                                            re.findall(_match_number, line)]
                line = f.readline().strip()
                segment['iproj'],segment['naos'],dummy,dummy,dummy,dummy = [
                                                    int(i) for i in line.split()]
                line = f.readline().strip()
                dos=[]
                while not line.startswith('-%-') and line:                
                    dos+=[float(s) for s in re.findall(_match_number, line)]
                    line = f.readline().strip()
                segment['dos'] = np.array(dos)
                segment['energy']=np.linspace(segment['ienergy'],segment['ienergy']+len(dos)*segment['denergy'],len(dos))
                doss_segments['segment{:03d}'.format(len(doss_segments)+1)] = segment
            else:
                line = f.readline().strip()  
        return doss_segments

class ECH3OutPlugin(object):
    """ parser plugin for jsonextended
    """
    plugin_name = 'crystal_ech3_out'
    plugin_descript = 'read CRYSTAL14 charge density out data'
    file_regex = '*ech3.out'
        
    def read_file(self, file_obj, **kwargs):
        """
 DIRECT LATTICE VECTOR COMPONENTS (ANGSTROM)
         0.00000    2.71000    2.71000
         2.71000    0.00000    2.71000
         2.71000    2.71000    0.00000
...
 *******************************************************************************
   ATOM N.AT.  SHELL    X(A)      Y(A)      Z(A)      EXAD       N.ELECT.
 *******************************************************************************
    1   14 SI    4     0.678     0.678     0.678   1.233E-01      14.000
    2   14 SI    4    -0.677    -0.678    -0.677   1.233E-01      14.000
 *******************************************************************************        
        """
        sites, coords = [], []
        line = file_obj.readline()
        while line:
            if line.strip().startswith('DIRECT LATTICE VECTOR COMPONENTS'):
                a = np.array(file_obj.readline().strip().split(),dtype=float)
                b = np.array(file_obj.readline().strip().split(),dtype=float)
                c = np.array(file_obj.readline().strip().split(),dtype=float)
            if line.strip().startswith('ATOM N.AT.'):
                line = file_obj.readline()
                line = file_obj.readline()
                while not line.strip().startswith('***'):
                    atom = line.strip().split()
                    sites.append(int(atom[1]))
                    coords.append(np.array(atom[4:7],dtype=float))
                    line = file_obj.readline()                
            line = file_obj.readline()
            
        lattice = pym.Lattice([a,b,c])
        struct = pym.Structure(lattice,sites,coords,
                               to_unit_cell=True,
                               coords_are_cartesian=True)
        return {'structure':struct}
        
class ECH3CubePlugin(object):
    """ parser plugin for jsonextended
    """
    plugin_name = 'crystal_ech3_cube'
    plugin_descript = 'read CRYSTAL14 charge density cube data'
    file_regex = '*ech3_dat.prop3d'
        
    def read_file(self, f, **kwargs):
        dic = {}

        na,nb,nc = [int(i) for i in f.readline().strip().split()]
        dic['na'],dic['nb'],dic['nc'] = na,nb,nc
        dic['o_vec'] = [float(i) for i in f.readline().strip().split()]
        dic['da_vec'] = np.array([float(i) for i in f.readline().strip().split()])
        dic['db_vec'] = np.array([float(i) for i in f.readline().strip().split()])
        dic['dc_vec'] = np.array([float(i) for i in f.readline().strip().split()]) 
        name = f.readline().strip()
        assert name == 'Charge density'
        charge_density = []
        line = f.readline().strip().split()
        while line:
            if line[0] == 'Spin':
                break
            charge_density += [float(s) for s in line]
            line = f.readline().strip().split()
        dense = np.array(charge_density).reshape((na,nb,nc))
        dic['charge_density'] = dense
        spin_density = []
        line = f.readline().strip().split()
        while line:
            spin_density += [float(s) for s in line]
            line = f.readline().strip().split()
        if spin_density:
            dense = np.array(spin_density).reshape((na,nb,nc))
            dic['spin_density'] = dense

        return dic
        
_load_errors = plugins.load_plugin_classes([BANDPlugin, DOSSPlugin, ECH3OutPlugin,ECH3CubePlugin,CIFPlugin],'parsers')
