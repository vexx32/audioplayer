/**
 * Constrains a value to a given upper and lower bound.
 *
 * @param {Number} number The value to constrain.
 * @param {Number} lowerBound The minimum allowed value.
 * @param {Number} upperBound The maximum allowed value.
 **/
function constrain(number, lowerBound, upperBound) {
    return Math.max(
        lowerBound,
        Math.min(upperBound, number));
}

class AudioPlayer {

    constructor() {
        "use strict";

        // Private variables
        const _elements = {
            audio: document.getElementById("audio"),
            playerButtons: {
                playBtn: document.querySelector(".main-toggle-btn"),
                nextTrackBtn: document.querySelector(".next-track-btn"),
                previousTrackBtn: document.querySelector(".previous-track-btn"),
                toggleLoopBtn: document.querySelector(".toggle-loop-btn")
            },
            progressBar: document.querySelector(".progress-box"),
            volumeBar: document.querySelector(".volume-box"),
            playlist: null,
            trackInfoBox: document.querySelector(".track-info-box")
        };
        var _currentTrack = null;
        var _trackLoaded = false;
        var _loopTrack = _elements.audio.dataset.loopTrack === "true";
        var _changePageTitle = _elements.audio.dataset.changePageTitle === "true";

        var _progressClicked = false;
        const _progressBarIndicator = _elements.progressBar.querySelector(".progress-indicator");
        const _progressBar = _elements.progressBar.querySelector(".progress");

        var _volumeClicked = false;
        const _volumeBar = _elements.volumeBar.querySelector(".volume");
        const _volumeIndicator = _elements.volumeBar.querySelector(".volume-indicator");

        this.getCurrentTrack = function() {
            if (!_trackLoaded) {
                return null;
            }

            return {
                index: _currentTrack,
                title: _elements.playlist[_currentTrack].textContent
            };
        };

        /**
         * Get the list of songs.
         * @returns {Array} an array of objects describing the index and title of each song in the playlist.
         */
        this.getPlaylist = function() {
            const list = [];
            for (let item of _elements.playlist) {
                list.push({
                    index: item.dataset.trackIndex,
                    title: item.textContent,
                    songUrl: _elements.audio.children[item.dataset.trackIndex].src
                });
            }

            return list;
        }


        /**
         * @param {Number} volume
         */
        const _setVolume = function(volume) {
            const volumeBarWidth = _volumeBar.offsetWidth - _volumeIndicator.offsetWidth;

            _updateVolumeIndicatorPosition(volumeBarWidth * volume);
            _setVolumeLevel(volume);
        };

        const _setVolumeLevel = function(volume) {
            _elements.audio.volume = constrain(volume, 0, 1);
        };

        const _updateVolumeIndicatorPosition = function(newPosition) {
            const volumeBarWidth = _volumeBar.offsetWidth - _volumeIndicator.offsetWidth;
            _volumeIndicator.style.left = constrain(newPosition, 0, volumeBarWidth) + "px";
        };

        /**
         * Updates the loop button to match the given looping setting.
         * @param {Boolean} loop The current looping setting, the button icon will be updated to match.
         */
        const _updateLoopIcon = function(loop) {
            const button = _elements.playerButtons.toggleLoopBtn;
            if (loop) {
                button.classList.add('on');
            } else if (button.classList.contains('on')) {
                button.classList.remove('on');
            }
        };

        /**
         * Set the audio playback volume.
         *
         * @param {Number} volume The audio volume, must be between 0 and 1.
         **/
        this.setVolume = _setVolume;

        /**
         * Set whether the audio player changes the page title to match the name of each track.
         * @param {Boolean} value
         */
        this.changePageTitle = function(value) {
            _changePageTitle = typeof value === "string" ? value === "true" : value === true;
        }

        /**
         * Determines the buffer progress.
         *
         * @param {HTMLElement} audio The audio element on the page.
         **/
        const _bufferProgress = function(audio) {
            let bufferedTime = 0;
            if (audio.readyState === 4) {
                bufferedTime = (audio.buffered.end(0) * 100) / audio.duration;
            }

            const progressBuffer = _elements.progressBar.querySelector(".progress-buffer");
            progressBuffer.style.width = bufferedTime + "%";
        };

        /**
         * @param {Event} event
         * @returns {number} The distance in pixels from the left border of the progress element to the left border of the
         * progress indicator element.
         */
        const _handleProgressIndicatorClick = function(event) {
            const progressBar = document.querySelector(".progress-box");
            return (event.pageX - progressBar.offsetLeft) / progressBar.querySelector('.progress').offsetWidth;
        };

        /**
         * @param {Event} event
         */
        const _handleVolumeControlClick = function(event) {
            const volumeBar = document.querySelector(".volume-box");
            const volume = (event.pageX - volumeBar.offsetLeft) / volumeBar.querySelector(".volume").offsetWidth;
            _setVolumeLevel(volume);
        };

        /**
         * Populates the playlist element with selectable track names
         *
         * @param {HTMLCollection} audioSources An array of &lt;source&gt; elements from the player's &lt;audio&gt; element.
         * @param {HTMLElement} listContainer The &lt;ul&gt; or &lt;ol&gt; container element to add &lt;li&gt; playlist elements to.
         * @returns {HTMLCollection} A list of the playlist elements generated.
         **/
        const _createTrackList = function(audioSources, listContainer) {
            for (let i = 0; i < audioSources.length; i++) {
                let track = audioSources[i];
                let listItem = document.createElement("li");
                listItem.classList.add("play-list-row");

                let trackTitle = track.dataset.trackTitle;
                let playlistLink = document.createElement("a");
                playlistLink.href = "#";
                playlistLink.textContent = trackTitle;
                playlistLink.classList.add("playlist-track");
                playlistLink.dataset.trackIndex = i;

                listItem.append(playlistLink);
                listContainer.append(listItem);

                //Playlist link clicked.
                playlistLink.addEventListener("click", _selectPlaylistTrack, false);
            }

            return listContainer.getElementsByClassName("playlist-track");
        };

        /**
         * @param {Event} event
         */
        const _selectPlaylistTrack = function(event) {
            event.preventDefault();
            let selectedTrack = parseInt(this.dataset.trackIndex);

            if (selectedTrack !== _currentTrack) {
                _resetPlayStatus();
                _currentTrack = null;
                _trackLoaded = false;
            }

            if (!_trackLoaded) {
                _currentTrack = parseInt(selectedTrack);
                _setTrack();
            } else {
                _playBack(this);
            }
        };

        /**
         * Initializes the html5 audio player and the playlist.
         **/
        const _initPlayer = function() {
            //Generate playlist entries from the audio elements
            _elements.playlist = _createTrackList(_elements.audio.children, document.querySelector(".play-list .play-list-popout"));

            //Audio time has changed so update it.
            _elements.audio.addEventListener("timeupdate", _trackTimeChanged, false);

            //Audio track has ended playing.
            _elements.audio.addEventListener("ended", function(event) {
                _trackHasEnded();
            }, false);

            //Audio error.
            _elements.audio.addEventListener("error", _handleAudioLoadError, false);

            //Large toggle button clicked.
            _elements.playerButtons.playBtn.addEventListener("click", function(event) {
                if (!_trackLoaded) {
                    _currentTrack = 0;
                    _setTrack();
                } else {
                    _playBack();
                }
            }, false);

            //Next track button clicked.
            _elements.playerButtons.nextTrackBtn.addEventListener("click", function(event) {
                if (this.disabled !== true) {
                    _currentTrack++;
                    _trackLoaded = false;
                    _resetPlayStatus();
                    _setTrack();
                }
            }, false);

            //Previous track button clicked.
            _elements.playerButtons.previousTrackBtn.addEventListener("click", function(event) {
                if (this.disabled !== true && _currentTrack !== null) {
                    let audio = _elements.audio;
                    if (audio.currentTime > 2 || _currentTrack === 0) {
                        audio.currentTime = 0;
                    } else {
                        _currentTrack--;
                        _trackLoaded = false;
                        _resetPlayStatus();
                        _setTrack();
                    }
                }
            }, false);

            //Toggle repeat button clicked
            _elements.playerButtons.toggleLoopBtn.addEventListener("click", function(event) {
                _loopTrack = !_loopTrack;
                _updateLoopIcon(_loopTrack);
            }, false);

            //User is moving progress indicator.
            _progressBarIndicator.addEventListener("mousedown", _progressMouseDown, false);
            _progressBar.addEventListener("mousedown", _progressMouseDown, false);

            //User is moving volume indicator.
            _volumeIndicator.addEventListener("mousedown", _volumeMouseDown, false);
            _volumeBar.addEventListener("mousedown", _volumeMouseDown, false);

            //User stops moving progress/volume indicator.
            window.addEventListener("mouseup", _mouseUp, false);

            //Check the audio player's volume attribute and set the slider and volume accordingly.
            let volume = 1;
            if (_elements.audio.hasAttribute("volume")) {
                volume = parseFloat(_elements.audio.getAttribute("volume"));
            }

            _setVolume(volume);
            _updateLoopIcon(_loopTrack);
        };

        const _handleAudioLoadError = function(event) {
            switch (event.target.error.code) {
                case event.target.error.MEDIA_ERR_ABORTED:
                    alert('The audio playback was deliberately aborted.');
                    break;
                case event.target.error.MEDIA_ERR_NETWORK:
                    alert('A network error caused the audio download to fail.');
                    break;
                case event.target.error.MEDIA_ERR_DECODE:
                    alert('The audio playback was aborted due to a corruption problem or because it used features your browser did not support.');
                    break;
                case event.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                    alert('The audio could not be loaded, either because the server or network failed or because the format is not supported.');
                    break;
                default:
                    alert('An unknown error occurred.');
                    break;
            }

            _trackLoaded = false;
            _resetPlayStatus();
        };

        /**
         * Handles the mousedown event on the progress bar by a user and determines if the mouse is being moved.
         *
         * @param e The event object.
         **/
        const _progressMouseDown = function(event) {
            if (_trackLoaded) {
                _moveProgressIndicator(event);
                window.addEventListener("mousemove", _moveProgressIndicator, true);
                _elements.audio.removeEventListener("timeupdate", _trackTimeChanged, false);

                _progressClicked = true;
            }
        };

        /**
         * Handles the mousedown event on the volume bar by a user and determines if the mouse is being moved.
         *
         * @param e The event object.
         **/
        const _volumeMouseDown = function(event) {
            _moveVolumeIndicator(event);
            window.addEventListener("mousemove", _moveVolumeIndicator, true);

            _volumeClicked = true;
        };

        /**
         * Handles the mouseup event by a user.
         *
         * @param e The event object.
         **/
        const _mouseUp = function(event) {
            if (_progressClicked) {
                const duration = parseFloat(audio.duration);
                const progressIndicatorClick = parseFloat(_handleProgressIndicatorClick(event));
                window.removeEventListener("mousemove", _moveProgressIndicator, true);

                _elements.audio.currentTime = duration * progressIndicatorClick;
                _elements.audio.addEventListener("timeupdate", _trackTimeChanged, false);
                _progressClicked = false;
            } else if (_volumeClicked) {
                _handleVolumeControlClick(event);
                window.removeEventListener("mousemove", _moveVolumeIndicator, true);

                _volumeClicked = false;
            }
        };

        /**
         * Moves the progress indicator to a new point in the audio.
         *
         * @param {Event} event The event object.
         **/
        const _moveProgressIndicator = function(event) {
            const progressBarWidth = _progressBar.offsetWidth - _progressBarIndicator.offsetWidth;
            let newPosition = 0;
            newPosition = event.pageX - _elements.progressBar.offsetLeft;

            if ((newPosition >= 1) && (newPosition <= progressBarWidth)) {
                _progressBarIndicator.style.left = newPosition + ".px";
            } else if (newPosition <= 0) {
                _progressBarIndicator.style.left = "0";
            } else if (newPosition > progressBarWidth) {
                _progressBarIndicator.style.left = progressBarWidth + "px";
            }
        };

        /**
         * Moves the progress indicator to a new point in the audio.
         *
         * @param {Event} event The event object.
         **/
        const _moveVolumeIndicator = function(event) {
            let newPosition = 0;
            newPosition = event.pageX - _elements.volumeBar.offsetLeft;

            _updateVolumeIndicatorPosition(newPosition);
            _handleVolumeControlClick(event);
        };

        /**
         * Controls playback of the audio element.
         **/
        const _playBack = function() {
            if (_elements.audio.paused) {
                _elements.audio.play();
                _updatePlayStatus(true);
                document.title = "\u25B6 " + document.title;
            } else {
                _elements.audio.pause();
                _updatePlayStatus(false);
                document.title = document.title.substr(2);
            }
        };

        /**
         * Sets the track if it hasn't already been loaded yet.
         **/
        const _setTrack = function() {
            if (_elements.audio.children.length === 1) {
                _currentTrack = 0;
            }

            const songURL = _elements.audio.children[_currentTrack].src;
            if (!_elements.audio.paused) {
                _playBack();
            }

            _elements.audio.setAttribute("src", songURL);
            _elements.audio.load();

            _progressBarIndicator.style.left = 0;
            _trackLoaded = true;

            _setTrackTitle(_currentTrack, _elements.playlist);
            _setActiveItem(_currentTrack, _elements.playlist);

            _elements.trackInfoBox.style.visibility = "visible";

            _playBack();
        };

        /**
         * Sets the actively playing item within the playlist.
         *
         * @param {Number} currentTrack The current track number being played.
         * @param {HTMLCollection} playlist The playlist object.
         **/
        const _setActiveItem = function(currentTrack, playlist) {
            for (let i = 0; i < playlist.length; i++) {
                let trackTitle = playlist[i];
                if (trackTitle.classList.contains('active-track')) {
                    trackTitle.classList.remove('active-track');
                }
            }

            playlist[currentTrack].classList.add("active-track");
        };

        /**
         * Sets the text for the currently playing song.
         *
         * @param {Number} currentTrack The current track number being played.
         * @param {HTMLCollection} playlist The playlist object.
         **/
        const _setTrackTitle = function(currentTrack, playlist) {
            const trackTitleBox = document.querySelector(".player .info-box .track-info-box .track-title-text");
            const trackTitle = playlist[currentTrack].outerText;

            trackTitleBox.innerHTML = null;
            trackTitleBox.innerHTML = trackTitle;

            if (_changePageTitle) {
                document.title = trackTitle;
            }
        };

        /**
         * Plays the next track when a track has ended playing.
         **/
        const _trackHasEnded = function() {
            parseInt(_currentTrack);
            if (!_loopTrack) {
                _currentTrack = (_currentTrack === _elements.playlist.length - 1) ? 0 : _currentTrack + 1;
            }

            _trackLoaded = false;
            document.title = document.title.substr(2);

            _resetPlayStatus();
            _setTrack();
        };

        /**
         * Updates the time for the song being played.
         **/
        const _trackTimeChanged = function() {
            const currentTimeBox = document.querySelector(".player .info-box .track-info-box.audio-time .current-time");
            const durationBox = document.querySelector(".player .info-box .track-info-box.audio-time .duration");

            currentTimeBox.innerHTML = null;
            currentTimeBox.innerHTML = _trackTime(audio.currentTime);

            durationBox.innerHTML = null;
            durationBox.innerHTML = _trackTime(audio.duration);

            _updateProgressIndicator(audio);
            _bufferProgress(audio);
        };

        /**
         * A utility function for converting a time in milliseconds to a readable time of minutes and seconds.
         *
         * @param {number} seconds The time in seconds.
         *
         * @return {string} The time in minutes and/or seconds.
         **/
        const _trackTime = function(seconds) {
            let min = 0;
            let sec = Math.floor(seconds);
            let time = 0;

            min = Math.floor(sec / 60);
            if (isNaN(min)) {
                min = 0;
            }

            min = min >= 10 ? min : '0' + min;

            sec = Math.floor(sec % 60);
            if (isNaN(sec)) {
                sec = 0;
            }

            sec = sec >= 10 ? sec : '0' + sec;
            time = min + ':' + sec;

            return time;
        };

        /**
         * Updates both the large and small toggle buttons accordingly.
         *
         * @param audioPlaying A boolean value indicating if audio is playing or paused.
         **/
        const _updatePlayStatus = function(audioPlaying) {
            const mainButton = _elements.playerButtons.playBtn;
            if (audioPlaying) {
                mainButton.classList.remove("large-play-btn");
                mainButton.classList.add("large-pause-btn");
            } else {
                mainButton.classList.remove("large-pause-btn");
                mainButton.classList.add("large-play-btn");
            }
        };

        /**
         * Updates the location of the progress indicator according to how much time left in audio.
         *
         **/
        const _updateProgressIndicator = function() {
            const currentTime = parseFloat(_elements.audio.currentTime);
            const duration = parseFloat(_elements.audio.duration);
            const progressBarWidth = parseFloat(_elements.progressBar.offsetWidth);
            const progressIndicatorWidth = parseFloat(_progressBarIndicator.offsetWidth);
            const progressBarIndicatorWidth = progressBarWidth - progressIndicatorWidth;
            let indicatorLocation = 0;

            indicatorLocation = progressBarIndicatorWidth * (currentTime / duration);

            _progressBarIndicator.style.left = Math.trunc(indicatorLocation) + "px";
        };

        /**
         * Resets all toggle buttons to be play buttons.
         **/
        var _resetPlayStatus = function() {
            const button = _elements.playerButtons.playBtn;
            button.classList.remove("large-pause-btn");
            button.classList.add("large-play-btn");
        };

        _initPlayer();
    }
}

var player = new AudioPlayer();