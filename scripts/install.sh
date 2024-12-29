# Install the plugin using the icloud sync folder

PLUGIN_NAME="bible-callout"
PLUGIN_DIRECTORY="$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/.obsidian/plugins"

# Clear the folder before copying
rm -rf "$PLUGIN_DIRECTORY/$PLUGIN_NAME"

# Create the directory and any necessary parent directories if they do not exist
mkdir -p "$PLUGIN_DIRECTORY/$PLUGIN_NAME"

# Copy the files and directories recursively
cp -r ./main.js ./manifest.json "$PLUGIN_DIRECTORY/$PLUGIN_NAME"
