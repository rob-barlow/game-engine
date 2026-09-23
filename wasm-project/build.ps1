$error.clear()

echo "Building..."

cp -Recurse -Force static\* www
wasm-pack build --target web --out-dir www/pkg 
