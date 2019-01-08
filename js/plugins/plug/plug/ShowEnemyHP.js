/*:
 * @plugindesc Show the enemy HP during a battle
 * @author Alejandro López
 *
 * @param Show single column
 * @desc Show single column picking an enemy or cut enemy name length
 * @default yes
 */

(function() {
	var parameters = PluginManager.parameters('ROKI_ShowEnemyHP');
	var singleColumn = parameters['Show single column'];
	var columnNumber = 1;
	
	if (singleColumn != "yes") {
		columnNumber = 2;
	}
	
	
	Window_BattleEnemy.prototype.drawItem = function(index) {
		this.resetTextColor();
		var name = this._enemies[index].name();
		var rect = this.itemRectForText(index);
		
		var enemyHp = this._enemies[index]._hp;
		var enemyMaxHp = this._enemies[index].mhp;
		var enemyHpRatio = enemyHp / enemyMaxHp;
		var hpText = enemyHp + "/" + enemyMaxHp;
		
		if (singleColumn != "yes") {
			if (name.length >= 12) { 
				name = name.substring(0, 9) + ".";
			}	
		}
		
		this.drawText(name + " HP:" + hpText, rect.x, rect.y, rect.width);
	};
	
	Window_BattleEnemy.prototype.maxCols = function() {
		return columnNumber;
	};

})();