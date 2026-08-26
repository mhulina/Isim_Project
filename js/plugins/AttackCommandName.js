//=============================================================================
// AttackCommandName.js
//=============================================================================

/*:
 * @plugindesc Renames the battle "Attack" command to match whatever skill
 * WeaponSkill.js has routed the attack to (e.g. a bow's <skill_id:x>).
 * @author Isim Project
 *
 * @help This plugin does not provide plugin commands.
 *
 * Works together with WeaponSkill.js: when a weapon's note box has
 * <skill_id:x>, attackSkillId() returns that skill instead of the default
 * Attack (id 1). This plugin makes the battle command label follow suit,
 * showing that skill's own name instead of always showing "Attack".
 *
 * Usage:
 * - Create/rename a skill to whatever you want the command to say
 *   (e.g. a skill literally named "Shoot").
 * - On the weapon (e.g. a Bow), set <skill_id:x> to that skill's id,
 *   same as you already do for WeaponSkill.js.
 * - With that weapon equipped, the Attack command reads "Shoot" instead
 *   of "Attack". Unequip it (or equip a weapon with no tag) and it goes
 *   back to "Attack", since skill id 1 is named "Attack" in the database.
 *
 * Load order relative to WeaponSkill.js does not matter — this reads
 * attackSkillId() fresh every time the battle command window is built.
 */

(function() {

  var _Window_ActorCommand_addAttackCommand =
      Window_ActorCommand.prototype.addAttackCommand;
  Window_ActorCommand.prototype.addAttackCommand = function() {
    _Window_ActorCommand_addAttackCommand.call(this);
    var index = this.findSymbol('attack');
    if (index < 0) return;
    var skill = $dataSkills[this._actor.attackSkillId()];
    if (skill) {
      this._list[index].name = skill.name;
    }
  };

})();
