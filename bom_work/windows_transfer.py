import os,sys,runpy
from pathlib import Path
def setxattr(path,name,value,*args,**kwargs):
 Path(str(path)+':'+os.fsdecode(name)).write_bytes(value)
def getxattr(path,name,*args,**kwargs):
 return Path(str(path)+':'+os.fsdecode(name)).read_bytes()
os.setxattr=setxattr
os.getxattr=getxattr
sys.argv=[str(Path(__file__).parent/'helpers'/'library_file_transfer.py')]+sys.argv[1:]
runpy.run_path(sys.argv[0],run_name='__main__')
