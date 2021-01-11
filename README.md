# HTML5 + JS Audio Player w/ Playlist

This basically started because my wife had a lot of trouble with the way the popular audio players work with Tumblr and how small things like certain links start to break in insidious ways when they load pages in iframes.
So I built this.

Credit where credit is due; the base code (which I've modified and extended to suit the needs of this project) comes from [a CodePen by Craig Stroman](https://codepen.io/craigstroman/pen/aOyRYx), which as a public Pen is licensed under the MIT license as detailed in CodePen's [Terms of Service](https://blog.codepen.io/documentation/terms-of-service/).

![example image of the audio player, showing the default pale white/grey theme](./themes/default/preview.png)

- [How to Use](#how-to-use)
  - [1. Add the style sheet to your page](#1-add-the-style-sheet-to-your-page)
  - [2. Add the player HTML code to your page](#2-add-the-player-html-code-to-your-page)
  - [3. Add a theme! (Optional)](#3-add-a-theme-optional)
- [Custom Themes](#custom-themes)
- [Contributing](#contributing)

## How to Use

There are a couple of things you'll need in order to use this audio player.
It consists of some HTML code you'll need to add to the page directly, a script file that handles the audio playing and some of the interface elements, and a CSS file to make things pretty.

You can also use one of the provided themes, create your own theme, and (if you want) further customise the player by overriding the default styles however you want.

### 1. Add the style sheet to your page

Place the following code inside your`<head>...</head>` section, **before** any `<style>` sections you may have there; this will ensure you can override the styles as much as you might want to, including using any of the provided themes you like.

```html
<link rel="stylesheet" href="https://static.tumblr.com/uhcvwhg/YwSqmpg04/player.css" />
```

### 2. Add the player HTML code to your page

Take all the code from [the player.htm file](player.htm) and add it to the main body of your page, preferably immediately before the `</body>` tag.

#### 2.1 Fiddle with settings (Optional)

There are a few configurable settings you can change at any time, all of which are on the `<audio>` element in the HTML code for the player.
Avoid touching the `id` unless you've also been messing around with the script yourself and you know what you're doing, but the rest are fair game.

It looks like this in your theme code, and I'll explain what the settings all do below:

```html
<audio id="audio" preload="auto" volume="0.5" data-loop-track="false" data-change-page-title="false">
```

- `preload` - Tells the browser whether or not to preload the first song as soon as the page loads. This can be set to:
  - `auto`: load the whole audio file for the first track as soon as the page loads.
  - `none`: disable preloading, the file will be loaded when the user clicks the Play button.
- `volume` - Sets the default audio volume. Values between 0 and 1 are acceptable.
- `data-loop-track` - Sets the default looping behaviour. Set this to `true` if you want to default the looping behaviour to `on`. Off by default.
- `data-change-page-title` - Set this to `true` if you want the page title to change to indicate the currently playing song. Off by default.

### 3. Add a theme! (Optional)

Themes consist of a small handful of style options, including:

- Font
- Text colours
- Background colours
- UI widget colours
- Player background image
- Button backgrounds

You can customize the player beyond this with minimal effort, but I thought it'd be nice to just condense the most likely things that would need changing most often into a single rule set.
That way, you don't have to manually find the bits and pieces for everything when you just want to use a fun background or some nicer colours.

Take the theme CSS from one of the [provided themes](./themes/theme-list.md) (or [make your own](#custom-themes)) and place it inside a `<style>...</style>` section on your page (should be in the `<head>...</head>` section).

## Custom Themes

The theme code for the default theme looks like this:

```css
/* Music Player theme settings */
.player-container.theme {
    --font-family: 'Segoe UI';
    /* colors */
    --text-color: #333;
    --background-color: #eee;
    --background-image: url();
    --border-color: rgba(0, 0, 0, 0.4);
    --playback-bar-color: #aaa;
    --progress-indicator-color: var(--background-color);
    --track-title-color: #444;
    /* button backgrounds */
    --play-button: url(https://raw.githubusercontent.com/vexx32/audioplayer/main/themes/default/play.svg) top left/contain;
    --pause-button: url(https://raw.githubusercontent.com/vexx32/audioplayer/main/themes/default/pause.svg) top left/contain;
    --previous-button: url(https://raw.githubusercontent.com/vexx32/audioplayer/main/themes/default/previous.svg) top left/contain;
    --next-button: url(https://raw.githubusercontent.com/vexx32/audioplayer/main/themes/default/next.svg) top left/contain;
    --loop-button-off: url(https://raw.githubusercontent.com/vexx32/audioplayer/main/themes/default/loop-off.svg) top left/contain;
    --loop-button-on: url(https://raw.githubusercontent.com/vexx32/audioplayer/main/themes/default/loop-on.svg) top left/contain;
    --playlist-button: url(https://raw.githubusercontent.com/vexx32/audioplayer/main/themes/default/playlist.svg) top left/contain;
    /* button text */
    --button-text-color: #000;
    --button-font: var(--font-family);
    --play-button-text: '';
    --pause-button-text: '';
    --previous-button-text: '';
    --next-button-text: '';
    --loop-button-off-text: '';
    --loop-button-on-text: '';
    --playlist-button-text: '';
}
```

Any of these values can be modified to adjust the look of the player to your liking.
Button background values are passed to a standard `background:` CSS property, so you can specify colors, images, sizes, positions, etc. for the button background.

## Contributing

If you wanna contribute code or themes or anything else for others to use, you're more than welcome to.
Drop themes in the `./themes` folder, either just as a .css file or a .css file with some finished assets in a subfolder.
Draft assets or Photoshop/Affinity Photo project files can go in the `./icons` folder, under a subdirectory indicating which theme they're associated with, if any.

The `demo.htm` file can be used to mess around with the project and test changes out, but do be aware that you'll need to run a separate browser instance with some security options disabled in order to use that, since it directly includes the `player.htm` file and most modern browsers don't expect local HTML files to want to do that.

This is how it's done for Chrome, you'll need to do some searching for other browsers, I'm not gonna document every browser here (feel free to add them here as you find them, if you like):

```powershell
& "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --user-data-dir="C:/users/username/Temp" --disable-web-security
```

Alternatively, you can skip that and just test it in a tumblr theme directly if you prefer. That's probably easier to do for most folks, and you needn't run an insecure browser session to test stuff. This is mostly just a note for me so I can test things without needing to load up a tumblr blog or something and rely too much on their infrastructure.
