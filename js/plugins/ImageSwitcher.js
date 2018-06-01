
(function(){

	//--------------------------------------------------------------------------
	// Game_Interpreter
	// 

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
		if (command.toLowerCase() === "LordBonesImageSwitcher") {
            function LordBonesImageSwitcher(pictureID,newPicture){
                if(pictureID <= 0 || pictureID > 100) {
                    $gameScreen._pictures[pictureID]._name = newPicture;
                }
            }
        }
    }
})