# node-lolicon

Discord bot for [Tenchou Fansubs' server](https://discord.gg/0nQQiDIRoCVmneeM).

## Triggers

### Core

Core triggers are always recognized as triggers. Though they might not be
always executed.

#### `refresh`

Rebuild the trigger list.

Since some triggers require external information in order to work
(e.g. a list of directories from Dropbox), they might cache some
data in order to reduce the bandwidth usage.

This command forces a cache reload.

#### `help`

Displays the available commands.

### Images

They *Image Triggers* depend on the content of a `Triggers` directory
in the app's root directory at Dropbox.

If there's a `Triggers/Headpat` directory, then the `!headpat`
trigger will be available.

When you execute an image trigger, a random image is selected from its
respective directory, and then sent to Discord.

## License

Apache 2.0
