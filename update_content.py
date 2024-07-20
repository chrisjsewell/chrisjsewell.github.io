from pathlib import Path
import shutil


exclude = ['update_content.py', '.gitignore', '.git', '.nojekyll']

for path in Path(__file__).parent.iterdir():
    if path.name in exclude:
        continue
    if path.is_dir():
        shutil.rmtree(path)
    else:
        path.unlink()


source = "../sphinx-lsp/docs/_build/html"

for path in Path(source).iterdir():
    if path.name in exclude or path.name.startswith('sphinx-index-v'):
        continue
    if path.is_dir():
        shutil.copytree(path, Path(__file__).parent / path.name)
    else:
        shutil.copy(path, Path(__file__).parent)
