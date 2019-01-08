/*:
 * AutoBattle.js
 * @plugindesc 自动战斗
 * @author 魏玉龙
 * @since 2018.09.12
 * @version 1.0
 *
 * @param enabled
 * @desc 开启自动战斗
 * @default true
 *
 * @param command
 * @desc 命令显示文字
 * @default 自动
 *
 * @param continous
 * @desc 是否连续的自动战斗
 * @default false
 *
 * @param skipMessage
 * @desc 跳过战斗中的消息
 * @default false
 *
 * @help
 * 此插件提供以下插件命令：
 *
 * AutoBattle enable
 *   开启自动战斗
 *
 * AutoBattle disable
 *   关闭自动战斗
 *
 * AutoBattle continous true/false
 *   是否开启连续的自动战斗
 *
 * AutoBattle skipMessage true/false
 *   是否跳过战斗中的消息
 *
 */

(function () {
  var parameters = PluginManager.parameters('AutoBattle');
  var autoBattle = {
    enabled: JSON.parse(parameters['enabled'] || true),
    command: String(parameters['command'] || '自动'),
    continous: JSON.parse(parameters['continous'] || false),
    skipMessage: JSON.parse(parameters['skipMessage'] || false)
  };

  var Game_Temp_prototype_initialize = Game_Temp.prototype.initialize;
  Game_Temp.prototype.initialize = function () {
    Game_Temp_prototype_initialize.call(this);
    this._continousAutoBattle = false;
  };

  var Scene_Battle_prototype_update = Scene_Battle.prototype.update;
  Scene_Battle.prototype.update = function () {
    Scene_Battle_prototype_update.call(this);
    if ($gameTemp._continousAutoBattle && (Input.isTriggered('escape') || Input.isTriggered('cancel'))) {
      SoundManager.playCancel();
      $gameTemp._continousAutoBattle = false;
    }
  }

  var Scene_Battle_prototype_createAllWindows = Scene_Battle.prototype.createAllWindows;
  Scene_Battle.prototype.createAllWindows = function () {
    if (!autoBattle.continous) {
      $gameTemp._continousAutoBattle = false;
    }
    Scene_Battle_prototype_createAllWindows.call(this);
  };

  var Scene_Battle_prototype_createPartyCommandWindow = Scene_Battle.prototype.createPartyCommandWindow;
  Scene_Battle.prototype.createPartyCommandWindow = function () {
    Scene_Battle_prototype_createPartyCommandWindow.call(this);
    if (autoBattle.enabled) {
      this._partyCommandWindow.setHandler('auto', this.commandAutoBattle.bind(this));
    }
  };

  var Scene_Battle_prototype_startPartyCommandSelection = Scene_Battle.prototype.startPartyCommandSelection;
  Scene_Battle.prototype.startPartyCommandSelection = function () {
    if ($gameTemp._continousAutoBattle && !SceneManager.isSceneChanging()) {
      this.commandAutoBattle.call(this);
    } else {
      Scene_Battle_prototype_startPartyCommandSelection.call(this)
    }
  };
  Scene_Battle.prototype.commandAutoBattle = function () {
    $gameParty.battleMembers().forEach(function (member) {
      if (member.canInput()) {
        member.makeAutoBattleActions();
      }
    });
    $gameTemp._continousAutoBattle = true;
    this._partyCommandWindow.deactivate();
    BattleManager.startTurn();
  };
  Scene_Battle.prototype.refreshAutobattlerStatusWindow = function () {
    $gameParty.battleMembers().forEach(function (member) {
      if (member.isAutoBattle()) {
        this._statusWindow.drawItem(member.index)
      }
    });
  };

  var Window_Message_prototype_startPause = Window_Message.prototype.startPause;
  Window_Message.prototype.startPause = function () {
    if ($gameParty.inBattle() && $gameTemp._continousAutoBattle && autoBattle.skipMessage) {
      this.terminateMessage();
    } else {
      Window_Message_prototype_startPause.call(this);
    }
  }

  var Window_PartyCommand_prototype_makeCommandList = Window_PartyCommand.prototype.makeCommandList;
  Window_PartyCommand.prototype.makeCommandList = function () {
    Window_PartyCommand_prototype_makeCommandList.call(this);
    if (autoBattle.enabled) {
      this.addCommand(autoBattle.command, 'auto');
    }
  };

  var Game_Interpreter_prototype_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    Game_Interpreter_prototype_pluginCommand.call(this, command, args);
    if (command === "AutoBattle") {
      switch (args) {
        case 'enable':
          autoBattle.enabled = true;
          break
        case 'disable':
          autoBattle.enabled = false;
          break
        case 'continous':
          autoBattle.continous = JSON.parse(args[1]);
          break
        case 'skipMessage':
          autoBattle.continous = JSON.parse(args[1]);
          break
      }
    }
  };
})();
