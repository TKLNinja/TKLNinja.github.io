//============================================================================
// Izy_RandomEventLocation.js
//----------------------------------------------------------------------------
// This script will locate the event at random position specified by region.
//============================================================================

var Imported = Imported || {};
Imported.Izy_SELBR = true;
Imported.Izy_SELBR_name = "Izy's Random Event Location";
Imported.Izy_SELBR_desc = "This script will locate the event at random position specified by region.";
Imported.Izy_SELBR_version = '1.01';
Imported.Izy_SELBR_author = 'Izyees Fariz';

var Izy_SELBR = Izy_SELBR || {};

/*:
 * @plugindesc v1.01 This script will locate the event at random position specified by region.
 * Izys library scripts.
 * @author Izyees Fariz
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 * This script will locate the event at random position specified by region.
 * You can use a region from 1-255.
 *
 * ============================================================================
 * Plugin Commands
 * ============================================================================
 * Plugin Command (incasesensitive):
 *
 *   set_locationx a b c
 *
 *   a - Event id. set 0 to current.
 *   b - Region id to be randomized the location.
 *   c - Direction 2,4,6,8(2-Down,4-Left,6-Right,8-Up). You can leave this
 *   blank (null)
 *
 * Example :
 *
 *   Set_LocationX 0 2
 *   - will randomized current event to region id 2.
 *   SET_LOCATIONX 3 1 4
 *   - will randomized event 3 to region 1 location and facing left.
 *
 * ============================================================================
 * Notetags
 * ============================================================================
 * Plugin Command (incasesensitive):
 *
 *   set_locationx(a,b,c)
 *
 *   a - Event id. set 0 to current.
 *   b - Region id to be randomized the location.
 *   c - Direction 2,4,6,8(2-Down,4-Left,6-Right,8-Up). You can leave this
 *   blank (null)
 *
 * Example :
 *
 *   Set_LocationX(0,2)
 *   - will randomized current event to region id 2.
 *   SET_LOCATIONX(3,1,4)
 *   - will randomized event 3 to region 1 location and facing left.
 *
 * ============================================================================
 * Changelog
 * ============================================================================
 * Version 1.01:
 * - Event will not overlap anymore. If there's no space, abort.
 * - Fix when there is no region.
 * Version 1.00:
 * - Finished Plugin!
 */

//============================================================================
// Variables
//============================================================================

Izy_SELBR.mapRegion = [];
Izy_SELBR.mapRegionData = [];

//============================================================================
// Startin' Script.
//============================================================================

Game_Map.prototype.izySetupRegion = function () {
	Izy_SELBR.mapRegion = [];
	Izy_SELBR.mapRegionData = [];
	for (i = 0; i <= 255; i++) {
		Izy_SELBR.mapRegion.push(i);
		Izy_SELBR.mapRegionData.push([]);
	}
	for (j = 0; j < $gameMap.width(); j++) {
		for (k = 0; k < $gameMap.height(); k++) {
			if (($gameMap.regionId(j, k) == 0) == false) {
				Izy_SELBR.mapRegionData[$gameMap.regionId(j, k)].push(j + "," + k);
			};
		};
	};
};

Game_Map.prototype.isEventHere = function (x, y) {
	for (i = 1; i < this._events.length; i++) {
		if (this._events[i].x == x) {
			if (this._events[i].y == y) {
				return true;
			}
		}
	}
	return false;
};

Game_Map.prototype.isPlayerHere = function (x, y) {
	if ($gamePlayer.x == x) {
		if ($gamePlayer.y == y) {
			return true;
		}
	}
	for (i = 1; i < $gamePlayer.followers()._data.length; i++) {
		if ($gamePlayer.followers()._data[i].x == x) {
			if ($gamePlayer.followers()._data[i].y == y) {
				return true;
			}
		}
	}
	return false;
};

Game_Event.prototype.setLocationX = function (eventId, regionId/* , facing */) {
	$gameMap.izySetupRegion();
	if (Izy_SELBR.mapRegionData[regionId].length > 0) {
		var rand = Math.floor((Math.random() * Izy_SELBR.mapRegionData[regionId].length) + 1);
		var mape = Izy_SELBR.mapRegionData[regionId][rand - 1];
		var texti = mape.split(/\s*,\s*/);
		if (eventId == 0) {
			if ($gameMap.isEventHere(texti[0], texti[1]) == false /* && $gameMap.isPlayerHere(texti[0], texti[1]) == false*/)  {
				this.locate(Number(texti[0]), Number(texti[1]));
				/* if (facing) {
					this.setDirection(facing);
				}; */
			}
			//implement else case: if gameMap.isEventHere == true: repeat setLocationX call!
		} else {
			if ($gameMap.isEventHere(texti[0], texti[1]) == false /* && $gameMap.isPlayerHere(texti[0], texti[1]) == false */) {
				$gameMap.event(eventId).locate(Number(texti[0]), Number(texti[1]));
				/* if (facing) {
					$gameMap.event(eventId).setDirection(facing);
				}; */
			}
			//implement else case: if gameMap.isEventHere == true: repeat setLocationX call!
		}
	} else {
		console.log("Failed to excute Izy_RandomEventLocation.js because the region id " + regionId + " is non exist in the map!")
	}
	return;
};

////////////////////////////////////////
// Plugin Command
///////////////////////////////////////

Izy_SELBR.Game_Interpreter_pluginCommand =
	Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function (command, args) {
	Izy_SELBR.Game_Interpreter_pluginCommand.call(this, command, args);
	if (command.toLowerCase() == 'set_locationx') {
		$gameMap.event(this._eventId).setLocationX(args[0], args[1]/* , args[2] */);
	};
};

////////////////////////////////////////
// Notetags *Not Working*
///////////////////////////////////////

/*
Game_Event.prototype.Repo = function () {
if (this.checkNeedReposition()) {
data = this.checkNeedReposition();
data = data.split(",");
this.setLocationX(data[0], data[1], data[2]);
}
};

Game_Event.prototype.checkNeedReposition = function () {
var note = $dataMap.events[this._eventId].note;
if (note.toLowerCase().contains("set_locationx")) {
var start_p = note.toLowerCase().indexOf("set_locationx(") + 14;
var end_p = note.toLowerCase().indexOf(")", start_p);
var command = note.toLowerCase().substring(start_p, end_p);
return command;
} else {
return false;
}

};

Izy_SELBR.Game_Event_setup =
Game_Event.prototype.setupPageSettings;
Game_Event.prototype.setupPageSettings = function() {
Izy_SELBR.Game_Event_setup.apply(this, arguments);
this.Repo();
};
 */

//============================================================================
// End Script.
//============================================================================
