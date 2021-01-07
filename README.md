# HTML5 + JS Audio Player w/ Playlist

This basically started because my wife had a lot of trouble with the way the popular audio players work with Tumblr and how small things like certain links start to break in insidious ways when they load pages in iframes.
So I built this.

Credit where credit is due; the base code (which I've modified and extended to suit the needs of this project) comes from [a CodePen by Craig Stroman](https://codepen.io/craigstroman/pen/aOyRYx), which as a public Pen is licensed under the MIT license as detailed in CodePen's [Terms of Service](https://blog.codepen.io/documentation/terms-of-service/).

- [How to Use](#how-to-use)
  - [Add the style sheet to your page](#add-the-style-sheet-to-your-page)
  - [Add the player HTML code](#add-the-player-html-code)
  - [Add a theme! (Optional)](#add-a-theme-optional)
- [Contributing](#contributing)

## How to Use

There are a couple of things you'll need in order to use this audio player.
It consists of some HTML code you'll need to add to the page directly, a script file that handles the audio playing and some of the interface elements, and a CSS file to make things pretty.

You can also use one of the provided themes, create your own theme, and (if you want) further customise the player by overriding the default styles however you want.

### 1. Add the style sheet to your page

Place the following code inside your`<head>...</head>` section, **before** any `<style>` sections you may have there; this will ensure you can override the styles as much as you might want to, including using any of the provided themes you like.

```html
<link rel="stylesheet" href="https://static.tumblr.com/aqcfmms/mW9qmjo8i/player.css" />
```

### 2. Add the player HTML code to your page

Take all the code from [the player.htm file](player.htm) and add it to the main body of your page, preferably immediately before the `</body>` tag.

### 3. Add a theme! (Optional)

Themes consist of a small handful of style options, including:

- Font
- Text colours
- Background colours
- UI widget colours
- Player background image
- Button backgrounds

You can customize the player beyond this with minimal effort, but I thought it'd be nice to just condense the most likely things that would need changing most often into a single rule set, so you don't have to manually find the bits and pieces for everything when you just want to use a fun background or some nicer colours.

Take the theme CSS and place it inside a `<style>...</style>` section on your page (should be in the `<head>...</head>` section).

## Custom Themes

The base theme code looks like this:

```css
/* Music Player theme settings */
.player-container.theme {
    --font-family: 'Segoe UI';
    /* colors */
    --text-color: #000;
    --background-color: white;
    --background-image: url();
    --border-color: rgba(0, 0, 0, 0.15);
    --playback-bar-color: #337ab7;
    --progress-indicator-color: var(--background-color);
    --track-title-color: #000;
    /* button backgrounds */
    --play-button: green;
    --pause-button: red;
    --previous-button: orange;
    --next-button: yellow;
    --loop-button-off: gray;
    --loop-button-on: blue;
    --playlist-button: brown;
}
```

Button background values are passed to a standard `background:` CSS property, so you can specify colors, images, sizes, positions, etc. for the button background.

## Contributing

If you wanna contribute code or themes or whatnot for others to use, you're more than welcome to.
Drop themes in the `./themes` folder, either just as a .css file or a .css file with some finished assets in a subfolder.
Draft assets or Photoshop/Affinity Photo project files can go in the `./icons` folder, under a subdirectory indicating which theme they're associated with, if any.

The `demo.htm` file can be used to mess around with the project and test changes out, but do be aware that you'll need to run a separate browser instance with some security options disabled in order to use that, since it directly includes the `player.htm` file and most modern browsers don't expect local HTML files to want to do that.

This is how it's done for Chrome, you'll need to do some searching for other browsers, I'm not gonna document every browser here (feel free to add them here as you find them, if you like):

```powershell
& "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --user-data-dir="C:/users/username/Temp" --disable-web-security
```

Alternatively, you can skip that and just test it in a tumblr theme directly if you prefer. That's probably easier to do for most folks, and you needn't run an insecure browser session to test stuff. This is mostly just a note for me so I can test things without needing to load up a tumblr blog or something and rely too much on their infrastructure.
