//==============================================================================
// Nio Simple max actor
//==============================================================================
/*:
  // Basic Header
   @plugindesc Small snipset who permit to increase the maximum battle member.
   @author Nio Kasgami 
   @Data : 2015/10/25
   @Version : 1.0.0
   @ Require : NA
//==============================================================================
 // PLUGINS BOX COMMAND
  @param Max member
  @desc Permit to change the max member in the party and battle.
  @default 4
  @help This plugin does not provide plugin commands.

  @param Member pos offset
  @desc Change the position in Y-axis for the members. it's a fix for avoid the overlaps with your status window.
  @default -40
 */


(function() {
	var parameters = PluginManager.parameters('Simple Max actor');
	var new_max_member = Number(parameters['Max member']);
	var members_posy_offset = Number(parameters['Member pos offset']);

//==============================================================================
// ■ Game_Party
//------------------------------------------------------------------------------
// The game object class for the party. Information such as gold and items is
// included.
//==============================================================================

//----------------------------------------------------------------------------
// ● overwrite function: maxBattleMembers
//----------------------------------------------------------------------------  
Game_Party.prototype.maxBattleMembers = function() {
    return new_max_member;
};

//===============================================================================
// => END : Game_Party
//===============================================================================

//==============================================================================
// ■ Sprite_Actor
//------------------------------------------------------------------------------
// The sprite for displaying an actor.
//==============================================================================

//----------------------------------------------------------------------------
// ● overwrite function: setActorHome
//----------------------------------------------------------------------------  
Sprite_Actor.prototype.setActorHome = function(index) {
    this.setHome(600 + index * 32, 280 + index * 48 + members_posy_offset);
};

})();
//===============================================================================
// => END : Sprite_Actor
//===============================================================================

//===============================================================================
// => END PLUGIN
//===============================================================================