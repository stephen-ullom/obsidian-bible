PLUGIN_DIRECTORY="$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/.obsidian/plugins"

# Clear the folder before copying
rm -rf "$PLUGIN_DIRECTORY/obsidian-bible"

# Create the directory and any necessary parent directories if they do not exist
mkdir -p "$PLUGIN_DIRECTORY/obsidian-bible"

# Copy the files and directories recursively
cp -r ./main.js ./manifest.json ./styles.css "$PLUGIN_DIRECTORY/obsidian-bible"
