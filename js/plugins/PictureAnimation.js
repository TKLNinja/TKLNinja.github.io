//=============================================================================
// PictureAnimation.js
// ----------------------------------------------------------------------------
// Copyright (c) 2015 Triacontane
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.4.0 2016/09/03 Added function to play designated SE according to animation
// 1.3.2 2016/05/11 Fixed an issue that may cause an error in the second animation display when crossfade is specified
// 1.3.1 2016/03/15 Resolve conflict with plug-in "PictureOnAnimation" which displays battle animation on pictures
//                  Fixed a problem that display position shifted if crossfading to the picture centering the origin
// 1.3.0 2016/02/28 Added function to link cell number with variable
//                  Slightly less processing load
// 1.2.3 2016/02/07 Fixed animation of picture on battle screen as well
// 1.2.2 2016/01/24 Fixed a phenomenon that an error occurred when trying to display an empty picture
// 1.2.1 2016/01/16 I specified the same image and executed in order of picture display → preparation of animation → picture display
//                  Correcting the phenomenon in which an error occurs in case
// 1.2.0 2016/01/04 Added function to freely specify cell pattern
//                  Increase the maximum number of cells from 100 to 200
// 1.1.2 2015/12/24 It corresponds to image change by cross fade
// 1.1.1 2015/12/21 Added function to specify the file name of picture by serial number method
//                  Added ability to kill animation
// 1.0.0 2015/12/19 First edition
// ----------------------------------------------------------------------------
// [Blog]   : http://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:
 * @plugindesc Picture animation plugin
 * @author Triacontane
 * 
 * @help Animate the picture at the specified frame interval.
 * Prepare cell image (*) you want to animate
 * Please enter the following commands.
 *
 * 1. Picture animation preparation (plug-in command)
 * 2. Picture display (normal event command)
 * 3. Start animation of picture (plug-in command)
 * 4. Picture animation end (plug-in command)
 *
 * There are three ways to arrange.
 *  Vertical: arranges the cells vertically to make the whole one file.
 *  Horizontal: The cells are arranged side by side to make the whole one file.
 *  Serial number: Prepare multiple cell images of serial numbers. (Original part is arbitrary character string)
 *   original00.png(Original file specified by picture display)
 *   original01.png
 *   original02.png...
 *
 * Careful! When using sequential numbers of placement methods, at the time of deployment
 * It may be excluded as unused files.
 * In that case, you need to cope with, such as cycling the deleted file.
 *
 * In addition to just animating it, you can also use plugin commands
 * You can specify the cell number directly, or link the value of the variable to the cell number.
 * In the case of directing like a picture-story show or changing the display state of standing pictures depending on conditions
 * valid.
 *
 * Plug-in command details
 *  Execute from event command "plugin command".
 *  (Parameters are separated by a space)
 *
 *  PA_INIT or
 *  Preparation of animation of picture [Number of cells] [Number of frames] [Cell arrangement method] [Fade time]
 *  　Prepare to animate the picture.
 *  　Please execute it immediately before "Picture display".
 *  　Number of cells: Number of cell images to animate (maximum 200)
 *  　Number of frames: Number of frames of animation interval (at least 1 is set)
 *  　Cell arrangement direction: Cell arrangement (vertical or horizontal or serial number)
 *  　Fade time: Number of frames for image switching (Do not fade when set to 0)
 *  Application example: PA_INIT 4 10 SerialNumber 20 (連番 = SerialNumber)
 *
 *  PA_START or
 *  Start animation of picture [Picture number] [Animation type] [Custom pattern array]
 *  　The animation of the picture with the specified picture number is started.
 *  　The animation will stop automatically when you go around. (more likely: ...after one round)
 *
 *  　There are three patterns of animation types.
 *  　　Example: When the number of cells is 4
 *  　　　type1: 1→2→3→4→1→2→3→4...
 *  　　　type2: 1→2→3→4→3→2→1→2...
 *  　　　type3: Specify the order of your choice by array (minimum value of cell is 1)
 *  Example of use：PA_START 1 2
 *  　　　　PA_START 1 3 [1,2,1,3,1,4]
 *
 *  PA_START_LOOP or
 *  Picture loop animation start [Picture number] [Animation type] [Custom pattern array]
 *  　The animation of the picture with the specified picture number is started.
 *  　Animation continues until explicitly finished.
 *  Example of use：PA_START_LOOP 1 2
 *  　　　　PA_START_LOOP 1 3 [1,2,1,3,1,4]
 *
 *  PA_STOP or
 *  Picture animation end [Picture number]
 *  　The animation of the picture with the specified picture number ends.
 *  　The animation stops when you return to the top cell.
 *  Example of use：PA_STOP 1
 *
 *  PA_STOP_FORCE or
 *  Picture animation forced termination [Picture number]
 *  　The animation of the picture with the specified picture number ends.
 *  　Animation stops at the cell currently displayed.
 *  Example of use：PA_STOP_FORCE 1
 *
 *  PA_SET_CELL or
 *  Picture animation cell setting [Picture number] [Cell number] [With wait]
 *  　Set animation cells directly. (The minimum value of the cell is 1)
 *  　This is useful when you want to animate at an arbitrary timing.
 *  　When wait is set, wait for execution of the event during cross fade.
 *  Example of use：PA_SET_CELL 1 3 WithWait (WithWait = WithWait)
 *
 *  PA_PROG_CELL or
 *  Animation of picture Cell progress [Picture number] [WithWait]
 *  　Advance the animation cells one by one.
 *  　This is useful when you want to animate at an arbitrary timing.
 *  　WithWait When setting, cross fade waits for the execution of the event.
 *  Example of use：PA_PROG_CELL 1 WithWait
 *
 *  PA_SET_VARIABLE or
 *  Set picture animation cell variable [Picture number] [Variable number]
 *  　Move the cell of the animation with the specified variable.
 *  　When the value of the variable changes, the displayed cell also changes automatically.
 *  Example of use：PA_SET_VARIABLE 1 2
 *
 *  PA_SOUND or
 *  Picture animation effect sound reservation [cell number]
 *  　Play the sound effect at the timing when the cell of the animation switched.
 *  　When the event command "perform SE" is executed immediately after this command
 *  　SE is not played on the spot, and after the animation of the picture starts, at the specified timing
 *  　It will be played.
 *  　Be sure to execute it before starting picture animation.
 *
 * Terms of service:
 *  It is possible to modify and redistribute without permission of the author, and use forms (commercial, 18 prohibition etc.)
 *  There is no restriction on it.
 *  This plugin is already yours.
 */
(function() {
    'use strict';
    var settings = {
        /* maxCellAnimation:Maximum number of cells */
        maxCellAnimation: 200
    };

    //=============================================================================
    // Local function
    //  We format and check plugin parameters and plugin command parameters
    //=============================================================================
    var getCommandName = function(command) {
        return (command || '').toUpperCase();
    };

    var getArgArrayString = function(args, upperFlg) {
        var values = getArgString(args, upperFlg);
        return (values || '').split(',');
    };

    var getArgArrayNumber = function(args, min, max) {
        var values = getArgArrayString(args, false);
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        for (var i = 0; i < values.length; i++) values[i] = (parseInt(values[i], 10) || 0).clamp(min, max);
        return values;
    };

    var getArgString = function(arg, upperFlg) {
        arg = convertEscapeCharacters(arg);
        return upperFlg ? arg.toUpperCase() : arg;
    };

    var getArgNumber = function(arg, min, max) {
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        return (parseInt(convertEscapeCharacters(arg), 10) || 0).clamp(min, max);
    };

    var convertEscapeCharacters = function(text) {
        if (text == null) text = '';
        var window = SceneManager._scene._windowLayer.children[0];
        return window ? window.convertEscapeCharacters(text) : text;
    };

    //=============================================================================
    // Game_Interpreter
    //  Define additional plugin commands.
    //=============================================================================
    var _Game_Interpreter_pluginCommand      = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        try {
            this.pluginCommandPictureAnimation(command, args);
        } catch (e) {
            if ($gameTemp.isPlaytest() && Utils.isNwjs()) {
                var window = require('nw.gui').Window.get();
                if (!window.isDevToolsOpen()) {
                    var devTool = window.showDevTools();
                    devTool.moveTo(0, 0);
                    devTool.resizeTo(Graphics.width, Graphics.height);
                    window.focus();
                }
            }
            console.log('An error occurred while executing the plug-in command.');
            console.log('- Command name 　: ' + command);
            console.log('- Command Arguments : ' + args);
            console.log('- Error cause   : ' + e.toString());
        }
    };

    Game_Interpreter.prototype.pluginCommandPictureAnimation = function(command, args) {
        var pictureNum, animationType, picture, cellNumber, frameNumber, direction, fadeDuration, wait, customArray;
        switch (getCommandName(command)) {
            case 'PA_INIT' :
            case 'Picture animation preparation':
                cellNumber   = getArgNumber(args[0], 1, settings.maxCellAnimation);
                frameNumber  = getArgNumber(args[1], 1, 9999);
                direction    = getArgString(args[2], true) || 'Vertical';
                fadeDuration = getArgNumber(args[3], 0, 9999) || 0;
                $gameScreen.setPicturesAnimation(cellNumber, frameNumber, direction, fadeDuration);
                break;
            case 'PA_SOUND' :
            case 'Picture animation effect sound reservation':
                cellNumber = getArgNumber(args[0], 1, settings.maxCellAnimation);
                this.reservePaSound(cellNumber);
                break;
            case 'PA_START' :
            case 'Start animation of picture':
                pictureNum    = getArgNumber(args[0], 1, $gameScreen.maxPictures());
                animationType = getArgNumber(args[1], 1, 3);
                customArray   = getArgArrayNumber(args[2], 1, settings.maxCellAnimation);
                picture       = $gameScreen.picture(pictureNum);
                if (picture) picture.startAnimationFrame(animationType, false, customArray);
                break;
            case 'PA_START_LOOP' :
            case 'Start loop animation of picture':
                pictureNum    = getArgNumber(args[0], 1, $gameScreen.maxPictures());
                animationType = getArgNumber(args[1], 1, 3);
                customArray   = getArgArrayNumber(args[2], 1, settings.maxCellAnimation);
                picture       = $gameScreen.picture(pictureNum);
                if (picture) picture.startAnimationFrame(animationType, true, customArray);
                break;
            case 'PA_STOP' :
            case 'Picture animation end':
                pictureNum = getArgNumber(args[0], 1, $gameScreen.maxPictures());
                picture    = $gameScreen.picture(pictureNum);
                if (picture) picture.stopAnimationFrame(false);
                break;
            case 'PA_STOP_FORCE' :
            case 'Kill animation of picture':
                pictureNum = getArgNumber(args[0], 1, $gameScreen.maxPictures());
                picture    = $gameScreen.picture(pictureNum);
                if (picture) picture.stopAnimationFrame(true);
                break;
            case 'PA_SET_CELL' :
            case 'Animation cell setting of picture':
                pictureNum = getArgNumber(args[0], 1, $gameScreen.maxPictures());
                cellNumber = getArgNumber(args[1], 1, settings.maxCellAnimation);
                wait       = getArgString(args[2]);
                picture    = $gameScreen.picture(pictureNum);
                if (picture) {
                    if (wait === 'WithWait' || wait.toUpperCase() === 'WAIT') this.wait(picture._fadeDuration);
                    picture.cell = cellNumber;
                }
                break;
            case 'PA_PROG_CELL' :
            case 'Picture animation cell progress':
                pictureNum = getArgNumber(args[0], 1, $gameScreen.maxPictures());
                wait       = getArgString(args[1]);
                picture    = $gameScreen.picture(pictureNum);
                if (picture) {
                    if (wait === 'WithWait' || wait.toUpperCase() === 'WAIT') this.wait(picture._fadeDuration);
                    picture.addCellCount();
                }
                break;
            case 'PA_SET_VARIABLE' :
            case 'Setting an animation cell variable for a picture':
                pictureNum = getArgNumber(args[0], 1, $gameScreen.maxPictures());
                picture    = $gameScreen.picture(pictureNum);
                if (picture) picture.linkToVariable(getArgNumber(args[1]));
                break;
        }
    };

    Game_Interpreter.prototype.reservePaSound = function(cellNumber) {
        this._paSoundFrame = cellNumber;
    };

    var _Game_Interpreter_command250      = Game_Interpreter.prototype.command250;
    Game_Interpreter.prototype.command250 = function() {
        if (this._paSoundFrame) {
            var se = this._params[0];
            AudioManager.loadStaticSe(se);
            $gameScreen.addPaSound(se, this._paSoundFrame);
            this._paSoundFrame = null;
            return true;
        }
        return _Game_Interpreter_command250.apply(this, arguments);
    };

    //=============================================================================
    // Game_Screen
    //  We keep additional animation related information.
    //=============================================================================
    Game_Screen.prototype.setPicturesAnimation = function(cellNumber, frameNumber, direction, fadeDuration) {
        this._paCellNumber   = cellNumber;
        this._paFrameNumber  = frameNumber;
        this._paDirection    = direction;
        this._paFadeDuration = fadeDuration;
    };

    Game_Screen.prototype.addPaSound = function(sound, frame) {
        if (!this._paSounds) this._paSounds = [];
        this._paSounds[frame] = sound;
    };

    Game_Screen.prototype.clearPicturesAnimation = function() {
        this._paCellNumber   = 1;
        this._paFrameNumber  = 1;
        this._paDirection    = '';
        this._paFadeDuration = 0;
        this._paSounds       = null;
    };

    var _Game_Screen_showPicture      = Game_Screen.prototype.showPicture;
    Game_Screen.prototype.showPicture = function(pictureId, name, origin, x, y,
                                                 scaleX, scaleY, opacity, blendMode) {
        _Game_Screen_showPicture.apply(this, arguments);
        var realPictureId = this.realPictureId(pictureId);
        if (this._paCellNumber > 1) {
            this._pictures[realPictureId].setAnimationFrameInit(
                this._paCellNumber, this._paFrameNumber, this._paDirection, this._paFadeDuration, this._paSounds);
            this.clearPicturesAnimation();
        }
    };

    //=============================================================================
    // Game_Picture
    //  We keep additional animation related information.
    //=============================================================================
    var _Game_Picture_initialize      = Game_Picture.prototype.initialize;
    Game_Picture.prototype.initialize = function() {
        _Game_Picture_initialize.call(this);
        this.initAnimationFrameInfo();
    };

    Game_Picture.prototype.initAnimationFrameInfo = function() {
        this._cellNumber        = 1;
        this._frameNumber       = 1;
        this._cellCount         = 0;
        this._frameCount        = 0;
        this._animationType     = 0;
        this._customArray       = null;
        this._loopFlg           = false;
        this._direction         = '';
        this._fadeDuration      = 0;
        this._fadeDurationCount = 0;
        this._prevCellCount     = 0;
        this._animationFlg      = false;
        this._linkedVariable    = 0;
        this._cellSes           = [];
    };

    Game_Picture.prototype.direction = function() {
        return this._direction;
    };

    Game_Picture.prototype.cellNumber = function() {
        return this._cellNumber;
    };

    Game_Picture.prototype.prevCellCount = function() {
        return this._prevCellCount;
    };

    Game_Picture.prototype.isMulti = function() {
        var dir = this.direction();
        return dir === 'SerialNumber' || dir === 'N';
    };

    /**
     * The cellCount of the Game_Picture (0 to cellNumber).
     *
     * @property cellCount
     * @type Number
     */
    Object.defineProperty(Game_Picture.prototype, 'cell', {
        get         : function() {
            if (this._linkedVariable > 0) {
                return $gameVariables.value(this._linkedVariable) % this._cellNumber;
            }
            switch (this._animationType) {
                case 3:
                    return (this._customArray[this._cellCount] - 1).clamp(0, this._cellNumber - 1);
                case 2:
                    return this._cellNumber - 1 - Math.abs(this._cellCount - (this._cellNumber - 1));
                case 1:
                    return this._cellCount;
                default:
                    return this._cellCount;
            }
        },
        set         : function(value) {
            var newCellCount = value % this.getCellNumber();
            if (this._cellCount !== newCellCount) {
                this._prevCellCount     = this.cell;
                this._fadeDurationCount = this._fadeDuration;
            }
            this._cellCount = newCellCount;
        },
        configurable: true
    });

    Game_Picture.prototype.getCellNumber = function() {
        switch (this._animationType) {
            case 3:
                return this._customArray.length;
            case 2:
                return (this._cellNumber - 1) * 2;
            case 1:
                return this._cellNumber;
            default:
                return this._cellNumber;
        }
    };

    var _Game_Picture_update      = Game_Picture.prototype.update;
    Game_Picture.prototype.update = function() {
        _Game_Picture_update.call(this);
        if (this.isFading()) {
            this.updateFading();
        } else if (this.hasAnimationFrame()) {
            this.updateAnimationFrame();
        }
    };

    Game_Picture.prototype.linkToVariable = function(variableNumber) {
        this._linkedVariable = variableNumber.clamp(1, $dataSystem.variables.length);
    };

    Game_Picture.prototype.updateAnimationFrame = function() {
        this._frameCount = (this._frameCount + 1) % this._frameNumber;
        if (this._frameCount === 0) {
            this.addCellCount();
            this.playCellSe();
            if (this._cellCount === 0 && !this._loopFlg) {
                this._animationFlg = false;
            }
        }
    };

    Game_Picture.prototype.updateFading = function() {
        this._fadeDurationCount--;
    };

    Game_Picture.prototype.prevCellOpacity = function() {
        if (this._fadeDuration === 0) return 0;
        return this.opacity() / this._fadeDuration * this._fadeDurationCount;
    };

    Game_Picture.prototype.addCellCount = function() {
        this.cell = this._cellCount + 1;
    };

    Game_Picture.prototype.playCellSe = function() {
        var se = this._cellSes[this.cell + 1];
        if (se)  {
            AudioManager.playSe(se);
        }
    };

    Game_Picture.prototype.setAnimationFrameInit = function(cellNumber, frameNumber, direction, fadeDuration, cellSes) {
        this._cellNumber   = cellNumber;
        this._frameNumber  = frameNumber;
        this._frameCount   = 0;
        this._cellCount    = 0;
        this._direction    = direction;
        this._fadeDuration = fadeDuration;
        this._cellSes      = cellSes || [];
    };

    Game_Picture.prototype.startAnimationFrame = function(animationType, loopFlg, customArray) {
        this._animationType = animationType;
        this._customArray   = customArray;
        this._animationFlg  = true;
        this._loopFlg       = loopFlg;
    };

    Game_Picture.prototype.stopAnimationFrame = function(forceFlg) {
        this._loopFlg = false;
        if (forceFlg) this._animationFlg = false;
    };

    Game_Picture.prototype.hasAnimationFrame = function() {
        return this._animationFlg;
    };

    Game_Picture.prototype.isFading = function() {
        return this._fadeDurationCount !== 0;
    };

    Game_Picture.prototype.isNeedFade = function() {
        return this._fadeDuration !== 0;
    };

    //=============================================================================
    // Sprite_Picture
    //  We keep additional animation related information.
    //=============================================================================
    var _Sprite_Picture_initialize      = Sprite_Picture.prototype.initialize;
    Sprite_Picture.prototype.initialize = function(pictureId) {
        this._prevSprite = null;
        _Sprite_Picture_initialize.apply(this, arguments);
    };

    var _Sprite_Picture_update      = Sprite_Picture.prototype.update;
    Sprite_Picture.prototype.update = function() {
        _Sprite_Picture_update.apply(this, arguments);
        var picture = this.picture();
        if (picture && picture.name()) {
            if (picture.isMulti() && !this._bitmaps) {
                this.loadAnimationBitmap();
            }
            if (this.isBitmapReady()) {
                this.updateAnimationFrame(this, picture.cell);
                if (picture.isNeedFade()) this.updateFading();
            }
        }
    };

    var _Sprite_Picture_updateBitmap      = Sprite_Picture.prototype.updateBitmap;
    Sprite_Picture.prototype.updateBitmap = function() {
        _Sprite_Picture_updateBitmap.apply(this, arguments);
        if (!this.picture()) {
            this._bitmaps = null;
            if (this._prevSprite) {
                this._prevSprite.bitmap = null;
            }
        }
    };

    Sprite_Picture.prototype.updateFading = function() {
        if (!this._prevSprite) {
            this.makePrevSprite();
        }
        if (!this._prevSprite.bitmap) {
            this.makePrevBitmap();
        }
        var picture = this.picture();
        if (picture.isFading()) {
            this._prevSprite.visible = true;
            this.updateAnimationFrame(this._prevSprite, picture.prevCellCount());
            this._prevSprite.opacity = picture.prevCellOpacity();
        } else {
            this._prevSprite.visible = false;
        }
    };

    Sprite_Picture.prototype.updateAnimationFrame = function(sprite, cellCount) {
        switch (this.picture().direction()) {
            case 'SerialNumber':
            case 'N':
                sprite.bitmap = this._bitmaps[cellCount];
                sprite.setFrame(0, 0, sprite.bitmap.width, sprite.bitmap.height);
                break;
            case 'Vertical':
            case 'V':
                var height = sprite.bitmap.height / this.picture().cellNumber();
                var y      = cellCount * height;
                sprite.setFrame(0, y, sprite.bitmap.width, height);
                break;
            case 'Horizontal':
            case 'H':
                var width = sprite.bitmap.width / this.picture().cellNumber();
                var x     = cellCount * width;
                sprite.setFrame(x, 0, width, this.bitmap.height);
                break;
        }
    };

    var _Sprite_Picture_loadBitmap      = Sprite_Picture.prototype.loadBitmap;
    Sprite_Picture.prototype.loadBitmap = function() {
        _Sprite_Picture_loadBitmap.apply(this, arguments);
        this._bitmapReady = false;
        this._bitmaps     = null;
    };

    Sprite_Picture.prototype.loadAnimationBitmap = function() {
        var cellNumber = this.picture().cellNumber();
        var cellDigit  = cellNumber.toString().length;
        this._bitmaps  = [this.bitmap];
        for (var i = 1; i < cellNumber; i++) {
            var filename     = this._pictureName.substr(0, this._pictureName.length - cellDigit) + i.padZero(cellDigit);
            this._bitmaps[i] = ImageManager.loadPicture(filename);
        }
        this._bitmapReady = false;
    };

    Sprite_Picture.prototype.makePrevSprite = function() {
        this._prevSprite         = new Sprite();
        this._prevSprite.visible = false;
        this.addChild(this._prevSprite);
    };

    Sprite_Picture.prototype.makePrevBitmap = function() {
        this._prevSprite.bitmap   = this.bitmap;
        this._prevSprite.anchor.x = this.anchor.x;
        this._prevSprite.anchor.y = this.anchor.y;
    };

    Sprite_Picture.prototype.isBitmapReady = function() {
        if (!this.bitmap) return false;
        if (this._bitmapReady) return true;
        var result;
        if (this.picture().isMulti()) {
            result = this._bitmaps.every(function(bitmap) {
                return bitmap.isReady();
            });
        } else {
            result = this.bitmap.isReady();
        }
        this._bitmapReady = result;
        return result;
    };
})();