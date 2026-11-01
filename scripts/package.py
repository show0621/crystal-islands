from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root = Path(__file__).resolve().parents[1]
out = root / 'dist/downloads/crystal-islands-project.zip'
out.parent.mkdir(parents=True, exist_ok=True)
with ZipFile(out, 'w', ZIP_DEFLATED) as z:
    for folder in ('dist', 'tests', 'scripts'):
        for p in sorted((root / folder).rglob('*')):
            if p.is_file() and 'downloads' not in p.relative_to(root).parts and '__pycache__' not in p.parts:
                z.write(p, 'crystal-islands/' + p.relative_to(root).as_posix())
    for name in ('package.json', 'README.md'):
        z.write(root / name, 'crystal-islands/' + name)
print(out)
