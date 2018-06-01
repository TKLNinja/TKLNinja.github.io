//=============================================================================
// Torigoya_SameEquipType.js
//=============================================================================

/*:
 * @plugindesc If equip slot name is the same, it can have an item of the same type
 * @author ru_shalm
 */

/*:ja
 * @help
 * @plugindesc If the equipment type name is the same, we will be able to equip items of the same type
 * @author ru_shalm
 */

(function () {
    var upstream_Game_Actor_equipSlots = Game_Actor.prototype.equipSlots;
    Game_Actor.prototype.equipSlots = function() {
        var slots = upstream_Game_Actor_equipSlots.apply(this);
        var n;
        for (var i = 1; i < $dataSystem.equipTypes.length; i++) {
            n = $dataSystem.equipTypes.indexOf($dataSystem.equipTypes[i]);
            if (n !== i) { slots[i - 1] = n; }
        }
        return slots;
    };
})();
