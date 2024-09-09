/*
 * ==============================================================================
 * * GTP: Gamefall Team Plugins - Alternative Menu Scene: Wolf Rpg Editor
 * ------------------------------------------------------------------------------
 *  AltMenu-WolfRpg.js  Version 1.3
 * ==============================================================================
 */

var Imported = Imported || {};
Imported.WolfMenu = true;
Imported.WolfMenu.version = 1.3;

var Gamefall = Gamefall || {};
Gamefall.WolfMenu = Gamefall.WolfMenu || {};

Gamefall.WolfMenu.sceneManager_initialize = SceneManager.initialize;
SceneManager.initialize = function() {
    Gamefall.WolfMenu.sceneManager_initialize.call(this);
    this.checkYanflyCore(1.23);
};

SceneManager.checkYanflyCore = function(version) {
    if(!Imported.YEP_CoreEngine) {
        var errorCore = "The plugin needs Yanfly Engine Core " + version + " version or higher to run";
        throw new Error(errorCore);
    }
};
/*:
* @plugindesc this plugin creates a menu scene similar to the one of Wolf Rpg Editor.
* IMPORTANT: Trigger PAGEUP or PAGEDOWN to switch between the actors' window status in the menu.
* @author Gamefall Team || Luca Mastroainni || Nebula Games
* @help All the details about the costumization are included in the plugin parameters itself.
* More features could be planned in next updates. To change the gauge colors, you should change
* the values of YEP_CoreEngine's parameters about HP, MP and TP (for exp gauge) bar color.
* IMPORTANT: Trigger PAGEUP or PAGEDOWN to switch between the actors' window status in the menu. 
* CHANGELOG: Version 1.0 -- Plugin Released
*            Version 1.1 -- Some bugs resolved.
*			 Version 1.2 -- Improved the code and added new PIXI Text Features;
*            Version 1.3 -- Added Cursor sound and compatibility with more than 4 party members;
* @param Show Face Or Sprite
* @desc Show Actor Face or Sprite in the menu status.
* FACE - true    SPRITE - false
* Default: true
* @default true
*
* @param Save help window text
* @desc Text in the help window of the Save Scene
* Default: Choose a slot to save in
* @default Choose a slot to save in
*
* @param Frame Color
* @desc The color of the frame around the faces or sprites
* Default: 0x9797a8
* @default 0x9797a8
*
*/

//###############################################################################
//
// PLUGIN COMMANDS
//
//###############################################################################

Gamefall.WolfMenu.parameters = PluginManager.parameters('GTP_WolfMenu');
Gamefall.WolfMenu.Show = eval(Gamefall.WolfMenu.parameters["Show Face Or Sprite"] || true);
Gamefall.WolfMenu.frameColor = Number(Gamefall.WolfMenu.parameters["FrameColor"] || 0x9797a8);
Gamefall.WolfMenu.saveText = String(Gamefall.WolfMenu.parameters["Save help window text"] || "Choose a slot to save in");

Gamefall.WolfMenu.styleHp = {
    fontFamily: 'GameFont',
    fontSize: '50px',
    fill: '#80feb2',
    strokeThickness: 10
}

Gamefall.WolfMenu.styleMp = {
    fontFamily: 'GameFont',
    fontSize: '50px',
    fill: '#80d2ff',
    strokeThickness: 10
}


//###############################################################################
//
// WINDOW PARTY
//
//###############################################################################

function Window_Party() {
    this.initialize.apply(this, arguments);
}

Window_Party.prototype = Object.create(Window_Selectable.prototype);
Window_Party.prototype.constructor = Window_Party;

Window_Party.prototype.initialize = function(x, y, actorId) {
    var width = this.windowWidth();
    var height = this.windowHeight();
    this._actorId = actorId;
    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this._formationMode = false;
    this.drawFrame();
    this.refresh();
};

Window_Party.prototype.standardBackOpacity = function() {
    return 255;
};

Window_Party.prototype.drawActorClass = function(actor, x, y, width) {
    width = width || 168;
    this.changeTextColor(this.textColor(8));
    this.drawText(actor.currentClass().name, x, y, width);
};

Window_Party.prototype.drawActorLevel = function(actor, x, y) {
    this.drawText(TextManager.levelA, x, y, 48);
    this.resetTextColor();
    this.drawText(actor.level, x + 10, y, 36, 'right');
};

Window_Party.prototype.drawActorExp = function(actor, x, y) {
    this.resetTextColor();
    this.drawTextEx('\\}' + "To Next Lv: " + actor.nextRequiredExp() + '\\{', x, y);
};

Window_Party.prototype.drawFrame = function() {
    var graph = new PIXI.Graphics();
    graph.lineStyle(1, Gamefall.WolfMenu.frameColor);
    graph.drawRect(0 + this.standardPadding(), 40 + this.standardPadding(), 144, 144);
    this.addChild(graph);
};

Window_Party.prototype.drawFaceStatus = function(index) {
    if (Gamefall.WolfMenu.Show === true) {
        this.drawActorFace($gameParty.members()[index], 0, 40); }
    else if (Gamefall.WolfMenu.Show === false) {
        this.drawActorCharacter($gameParty.members()[index], 75, 135);
    }
};

Window_Party.prototype.drawActorExpGauge = function(actor, x, y, width) {
    width = width || 186;
    var color1 = this.tpGaugeColor1();
    var color2 = this.tpGaugeColor2();
    var exp = actor.currentExp() - actor.expForLevel(actor._level);
    var ExpS = actor.expForLevel(actor._level + 1) - actor.expForLevel(actor._level);
    var expRate = (exp / ExpS);
    this.drawGauge(x, y, width, expRate, color1, color2);
};

Window_Party.prototype.makeFontBigger = function() {
    if (this.contents.fontSize <= 96) {
        this.contents.fontSize += 15;
    }
};

Window_Party.prototype.makeFontSmaller = function() {
    if (this.contents.fontSize >= 24) {
        this.contents.fontSize -= 15;
    }
};

Window_Party.prototype.processOk = function() {
    Window_Selectable.prototype.processOk.call(this);
    $gameParty.setMenuActor(this.actor());
};

Window_Party.prototype.selectLast = function() {
    this.select($gameParty.menuActor().index() || 0);
};

Window_Party.prototype.formationMode = function() {
    return this._formationMode;
};

Window_Party.prototype.setFormationMode = function(formationMode) {
    this._formationMode = formationMode;
};

Window_Party.prototype.updateCursor = function() {
    if (this._cursorAll) {
        var ARH = this.maxRows() * this.itemHeight();
        this.setCursorRect(0, 0, this.contents.width, ARH);
        this.setTopRow(0);
    } else if (this.isCursorVisible()) {
        var rect = this.itemRect(this.index());
        rect.x = 0; 
        rect.y = 0; 
        rect.width = 280; 
        rect.height = 250; 
        this.setCursorRect(rect.x, rect.y, rect.width, rect.height);
    } else {
        this.setCursorRect(0, 0, 0, 0);
    }
};

Window_Party.prototype.windowWidth = function() {
    return 280;
};

Window_Party.prototype.windowHeight = function() {
    return 250;
};

Window_Party.prototype.actor = function() {
    return $gameParty.members()[this._actorId];
};

Window_Party.prototype.refresh = function() {
    var x = this.textPadding();
    var width = this.contents.width - this.textPadding() * 2;
    this.contents.clear();
    this.contents.fontSize = 19;
    this.drawActorName(this.actor(), 5, 0);
    this.drawFaceStatus(this._actorId);
    this.drawActorClass(this.actor(), 135, 0);
    this.drawActorHp(this.actor(), 150, 40, this.contents.width - 150);
    this.drawActorMp(this.actor(), 150, 90, this.contents.width - 150);
    this.drawActorExpGauge(this.actor(), 110, 180, this.contents.width - 110);
    this.drawActorLevel(this.actor(), 55, 183);
    this.drawActorExp(this.actor(), 120, 170);

};

Window_Party.prototype.open = function() {
    this.refresh();
    Window_Base.prototype.open.call(this);
};

Window_Party.prototype._refreshCursor = function() {
    var pad = 0;
    var x = this._cursorRect.x + pad - this.origin.x;
    var y = this._cursorRect.y + pad - this.origin.y;
    var w = this._cursorRect.width;
    var h = this._cursorRect.height;
    var m = 4;
    var x2 = Math.max(x, pad);
    var y2 = Math.max(y, pad);
    var ox = x - x2;
    var oy = y - y2;
    var w2 = Math.min(w, this._width - 0 - x2);
    var h2 = Math.min(h, this._height - 0 - y2);
    var bitmap = new Bitmap(w2, h2);

    this._windowCursorSprite.bitmap = bitmap;
    this._windowCursorSprite.setFrame(0, 0, w2, h2);
    this._windowCursorSprite.move(x2, y2);

    if (w > 0 && h > 0 && this._windowskin) {
        var skin = this._windowskin;
        var p = 96;
        var q = 48;
        bitmap.blt(skin, p+m, p+m, q-m*2, q-m*2, ox+m, oy+m, w-m*2, h-m*2);
        bitmap.blt(skin, p+m, p+0, q-m*2, m, ox+m, oy+0, w-m*2, m);
        bitmap.blt(skin, p+m, p+q-m, q-m*2, m, ox+m, oy+h-m, w-m*2, m);
        bitmap.blt(skin, p+0, p+m, m, q-m*2, ox+0, oy+m, m, h-m*2);
        bitmap.blt(skin, p+q-m, p+m, m, q-m*2, ox+w-m, oy+m, m, h-m*2);
        bitmap.blt(skin, p+0, p+0, m, m, ox+0, oy+0, m, m);
        bitmap.blt(skin, p+q-m, p+0, m, m, ox+w-m, oy+0, m, m);
        bitmap.blt(skin, p+0, p+q-m, m, m, ox+0, oy+h-m, m, m);
        bitmap.blt(skin, p+q-m, p+q-m, m, m, ox+w-m, oy+h-m, m, m);
    }
};

//###############################################################################
//
// MENU COMMAND
//
//###############################################################################

Window_MenuCommand.prototype.numVisibleRows = function() {
    return 5;
};

Window_MenuCommand.prototype.standardBackOpacity = function() {
    return 255;
};

Window_MenuCommand.prototype.makeCommandList = function() {
    this.addMainCommands();
    this.addOriginalCommands();
    this.addOptionsCommand();
    this.addSaveCommand();
    this.addGameEndCommand();
};

//###############################################################################
//
// WINDOW GOLD
//
//###############################################################################

Window_Gold.prototype.standardBackOpacity = function() {
    return 255;
};

//###############################################################################
//
// SCENE MENU
//
//###############################################################################


Scene_Menu.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createAllWindows();
    this.setup();
};

Scene_Menu.prototype.createAllWindows = function() {
    this.createCommandWindow();
    this.createGoldWindow();
    this.createAllParty();
    this.createHelpWindow();
    this.createItemWindow();
    this.createItemDesc();
    this.createWolfWindow();
    this.createSkillWindow();
};

Scene_Menu.prototype.setup = function() {
    this._actualIndex = 0;
    this._forItem = false;
    this._forSkill = false;
    this._textHp = null;
    this._textMp = null;
    this._time = 100;
    this._startAnimation = false;
    this._commandWindow.x = 0;
    this._goldWindow.x = 0;
    this._goldWindow.y = 551;
};


Scene_Menu.prototype.updateHelpPosition = function() {
    if(this._itemWindow.isOpenAndActive() || this._skillWindow.isOpenAndActive()) {
        this._helpWindow.x = this._itemWindow.x;
        this._helpWindow.y = this._itemWindow.height + this._itemWindow.y;
        this._helpWindow.width = this._itemWindow.width;
        if(this._helpWindow.isClosed()) this._helpWindow.open();
    }
};

Scene_Menu.prototype.createAllParty = function() {
    this._partyWindow = [];
    for(i = 0; i < $gameParty.size(); i++) {
        var x = this.determineX(i);
        var y = this.determineY(i);
        this._partyWindow[i] = new Window_Party(x, y, i);
        this.addWindow(this._partyWindow[i]);
    }
};

Scene_Menu.prototype.createItemDesc = function() {
    this._itemDesc = new Window_ItemSpec(this._goldWindow);
    this.addWindow(this._itemDesc);
};

Scene_Menu.prototype.createSkillWindow = function() {
    var wx = this._itemWindow.x;
    var wy = this._itemWindow.y;
    var ww = this._itemWindow.width;
    var wh = this._itemWindow.height;
    this._skillWindow = new Window_SkillList(wx, wy, ww, wh);
    this._skillWindow.setHelpWindow(this._helpWindow);
    this._skillWindow.setHandler('ok',     this.onItemOk.bind(this));
    this._skillWindow.setHandler('cancel', this.onItemCancel.bind(this));
    this._skillWindow.openness = 0;
    this._skillWindow.setStypeId(0);
    this._skillWindow.select(0);
    this.addWindow(this._skillWindow);
};


Scene_Menu.prototype.update = function() {
    Scene_MenuBase.prototype.update.call(this);
    this.checkTrigger();
    this.updateHelpPosition();
    if(this._startAnimation) this.textAnimation();
};

Scene_Menu.prototype.commandItem = function() {
    this._itemWindow.open();
    this._forItem = true;
    this._commandWindow.deactivate();
    this._itemWindow.activate();
};

Scene_Menu.prototype.commandSave = function() {
    this._wolfWindow.open();
    this._helpWindow.setText(Gamefall.WolfMenu.saveText)
    this._helpWindow.open()
    this._commandWindow.deactivate();
    this._wolfWindow.activate();
};

Scene_Menu.prototype.determineX = function(num) {
    if(num % 2 === 0) return this._commandWindow.width
    else return this._partyWindow[num - 1].width + 240
};

Scene_Menu.prototype.determineY = function(num) {
	if(num % 2 === 0) return this._commandWindow.y + (250 * (num / 2))
	else return this._commandWindow.y + (250 * ((num - 1) / 2))
    
}

Scene_Menu.prototype.start = function() {
    Scene_MenuBase.prototype.start.call(this);
    this._partyWindow.forEach(function(window) { return window.refresh()});
};


Scene_Menu.prototype.commandPersonal = function() {
    var actual = this._partyWindow[this._actualIndex];
    actual.setFormationMode(false);
    actual.selectLast();
    actual.activate();
    if(this._forItem || this._forSkill) actual.setHandler('ok', this.onActorOk.bind(this));
    else actual.setHandler('ok', this.onPersonalOk.bind(this));
    actual.setHandler('cancel', this.onPersonalCancel.bind(this));
};

Scene_Menu.prototype.checkTrigger = function() {
    if(this._partyWindow.some(function(window) { return window.active == true })) {
        if(Input.isTriggered('right')) {
            var actual = this._partyWindow[this._actualIndex];
            actual.deactivate();
            actual.deselect()
            if(this._actualIndex === $gameParty.size() - 1) this._actualIndex = 0;
            else this._actualIndex += 1;
            this.commandPersonal();
            SoundManager.playCursor()
            this.checkScreenTouch()
        }
        else if(Input.isTriggered('left')) {
            var actual = this._partyWindow[this._actualIndex];
            actual.deactivate();
            actual.deselect()
            if(this._actualIndex == 0) this._actualIndex = $gameParty.size() - 1;
            else this._actualIndex -= 1;
            this.commandPersonal();
            SoundManager.playCursor()
            this.checkScreenTouch()
        }
        if($gameParty.size() > 2) {
            if(Input.isTriggered('down')) {
                var actual = this._partyWindow[this._actualIndex];
                actual.deactivate();
                actual.deselect()
                var num = this._actualIndex % 2 === 0 ? this._actualIndex : this._actualIndex - 1
                if(this._actualIndex + 2 > $gameParty.size() - 1) this._actualIndex = this._actualIndex - num;
                else this._actualIndex += 2;
                this.commandPersonal();
                SoundManager.playCursor()
                this.checkScreenTouch()
            }
            else if(Input.isTriggered('up')) {
                var actual = this._partyWindow[this._actualIndex];
                actual.deactivate();
                actual.deselect()
                var num = this._actualIndex === 0 ? ($gameParty.size() - 1) - (($gameParty.size() - 1) % 2) : $gameParty.size() - ((($gameParty.size()) % 2) + 1)
               	console.log(this._actualIndex)
                if(this._actualIndex - 2 < 0) this._actualIndex = num;
                else this._actualIndex -= 2;
                this.commandPersonal();
                SoundManager.playCursor()
                this.checkScreenTouch()
            }
        }
    }
}

Scene_Menu.prototype.checkScreenTouch = function() {
	var y = this._partyWindow[this._actualIndex].y
	var height = this._partyWindow[this._actualIndex].height
	if(y < 0) {
		this._partyWindow.forEach(function(window) {
			window.y += Math.abs(y) 
		})
	}
	else if(y + height > Graphics.boxHeight) {
		this._partyWindow.forEach(function(window) {
			window.y -= Math.abs(Graphics.boxHeight - (y + height))
		})		
	}
	else return;
}


Scene_Menu.prototype.onPersonalOk = function() {
    switch (this._commandWindow.currentSymbol()) {
    case 'skill':
        this._skillWindow.setActor($gameParty.members()[this._actualIndex]);
        this._skillWindow.open();
        this._skillWindow.activate();
        this._forSkill = true;
        break;
    case 'equip':
        SceneManager.push(Scene_Equip);
        break;
    case 'status':
        SceneManager.push(Scene_Status);
        break;
    }
};

Scene_Menu.prototype.onPersonalCancel = function() {
    this._partyWindow.forEach(function(window, index) { 
        window.deselect();
        window.deactivate();
        window.y = this.determineY(index)
    }, this)
    this._actualIndex = 0;
    if(!this._forItem && !this._forSkill) this._commandWindow.activate();
    else if(this._forItem) {
        this._itemWindow.open();
        this._helpWindow.open();
        this._itemWindow.activate();
        this._itemDesc.close();
    }
    else if(this._forSkill) {
        this._skillWindow.open();
        this._helpWindow.open;
        this._skillWindow.activate();
        this._itemDesc.close();
    }
};

//--------------------------------------------------------- ITEM METHODS


Scene_Menu.prototype.item = function() {
    if(this._forItem) return this._itemWindow.item();
    else if(this._forSkill) return this._skillWindow.item();
};

Scene_Menu.prototype.user = function() {
    if(this._forItem) { 
        var members = $gameParty.movableMembers();
        var bestActor = members[0];
        var bestPha = 0;
        for (var i = 0; i < members.length; i++) {
            if (members[i].pha > bestPha) {
                bestPha = members[i].pha;
                bestActor = members[i];
            }
        }
        return bestActor;
    }
    else if(this._forSkill) return this._skillWindow._actor;
};

Scene_Menu.prototype.onItemOk = function() {
    if(this._forItem) $gameParty.setLastItem(this.item());
    else if(this._forSkill) this._skillWindow._actor.setLastMenuSkill(this.item())
    this.determineItem();
    this._itemDesc.open();
    this._itemDesc.refresh();
};

Scene_Menu.prototype.onItemCancel = function() {
    if(this._forItem) {
        this._itemWindow.deactivate();
        this._commandWindow.activate();
        this._helpWindow.close();
        this._itemWindow.close();
        this._forItem = false;
    }
    else if(this._forSkill) {
        this._skillWindow.deactivate();
        this._helpWindow.close();
        this._skillWindow.close();
        this._partyWindow[this._actualIndex].activate()
        this._forSkill = false;       
    }
};

Scene_Menu.prototype.playSeForItem = function() {
    SoundManager.playUseItem();
};

Scene_Menu.prototype.useItem = function() {
    this.playSeForItem();
    this.user().useItem(this.item());
    this.applyItem();
    this.checkCommonEvent();
    this.checkGameover();
    this._partyWindow.forEach(function(window) { return window.refresh(); });
    if(this._forItem) this._itemWindow.redrawCurrentItem();
    else if(this._forSkill) this._skillWindow.refresh();
    this._partyWindow[this._actualIndex].activate();
    this._cursorFixed = true;
    if(this._forItem) this._startAnimation = true;
    this._itemDesc.refresh();
};

Scene_Menu.prototype.textAnimation = function() {
    this._time--;
    var item = $gameParty.lastItem();
    if(this._textHp == null && this._time > 0) {
        var plusHp = item.effects.filter(function(effect) { return effect.code == 11});
        if(plusHp.length > 0) {
            var txtHp = String(Math.floor(plusHp[0].value2 + (plusHp[0].value1 * this.user().hp)));
            this._textHp = new PIXI.Text(txtHp, Gamefall.WolfMenu.styleHp);
            this._textHp.x = this._partyWindow[this._actualIndex].x + this._partyWindow[this._actualIndex].width / 2 - 30;
            this._textHp.y = this._partyWindow[this._actualIndex].y + this._partyWindow[this._actualIndex].height / 2 - 40;
            this.addChild(this._textHp);
        }
    }
    if(this._textMp == null && this._time > 0) {
        var plusMp = item.effects.filter(function(effect) { return effect.code == 12});
        if(plusMp.length > 0) {
            var txtMp = String(Math.floor(plusMp[0].value2 + (plusMp[0].value1 * this.user().mp)));
            var delay = this._textHp !== null ? this._textHp.height : 0;
            this._textMp = new PIXI.Text(txtMp, Gamefall.WolfMenu.styleMp);
            this._textMp.x = this._partyWindow[this._actualIndex].x + this._partyWindow[this._actualIndex].width / 2 - 30;
            this._textMp.y = this._partyWindow[this._actualIndex].y + this._partyWindow[this._actualIndex].height / 2 - 40 + (delay);
            this.addChild(this._textMp);
        }
    }
    if(this._time <= 0 && (this._textHp !== null || this._textMp !== null)) {
        if(this._textHp !== null && this._textHp.alpha > 0) this._textHp.alpha -= 0.05;
        if(this._textMp !== null && this._textMp.alpha > 0) this._textMp.alpha -= 0.05;

        if((this._textHp !== null && this._textHp.alpha <= 0) || (this._textMp !== null && this._textMp.alpha <= 0)) {
            if(this._textHp !== null) this.removeChild(this._textHp);
            if(this._textMp !== null) this.removeChild(this._textMp);
            this._startAnimation = false;
            this._partyWindow[this._actualIndex]._windowCursorSprite.setColorTone([0, 0, 0, 0]);
            this._cursorFixed = false;
            this._textHp = null;
            this._textMp = null;
            this._time = 100;
        }
    } 
};

Scene_Menu.prototype.createItemWindow = function() {
    var wy = this._helpWindow.height;
    var wh = Graphics.boxHeight;
    this._itemWindow = new Window_ItemList(115, 50, 600, 445);
    this._itemWindow.setHelpWindow(this._helpWindow);
    this._itemWindow.setHandler('ok',     this.onItemOk.bind(this));
    this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this));
    this._itemWindow.setCategory('all');
    this.addWindow(this._itemWindow);
    this._itemWindow.select(0);
};

Scene_Menu.prototype.onActorOk = function() {
    if (this.canUse()) {
        this._partyWindow[this._actualIndex]._windowCursorSprite.setColorTone([-100, 13, -102, 155]);
        this.useItem();
        console.log('ok!');
    } else {
        SoundManager.playBuzzer();
        this._partyWindow[this._actualIndex].activate();
        this._partyWindow[this._actualIndex].selectLast();
    }
};

Scene_Menu.prototype.determineItem = function() {
    var action = new Game_Action(this.user());
    var item = this.item();
    action.setItemObject(item);
    if (action.isForFriend()) {
        if(this._forItem) {
            this._itemWindow.close();
            this._helpWindow.close();
        }
        else if(this._forSkill) {
            this._skillWindow.close();
            this._helpWindow.close();
        }
            this.commandPersonal();
    } else {
        this.useItem();
        if(this._forItem) this.activateItemWindow();
        else if(this._forSkill) this.activateSkillWindow();
    }
};

Scene_Menu.prototype.activateItemWindow = function() {
    this._itemWindow.refresh();
    this._itemWindow.activate();
};

Scene_Menu.prototype.activateSkillWindow = function() {
    this._skillWindow.refresh();
    this._skillWindow.activate();
};

Scene_Menu.prototype.itemTargetActors = function() {
    var action = new Game_Action(this.user());
    action.setItemObject(this.item());
    if (!action.isForFriend()) {
        return [];
    } else if (action.isForAll()) {
        return $gameParty.members();
    } else {
        return [$gameParty.members()[this._actualIndex]];
    }
};

Scene_Menu.prototype.canUse = function() {
    return this.user().canUse(this.item()) && this.isItemEffectsValid();
};

Scene_Menu.prototype.isItemEffectsValid = function() {
    var action = new Game_Action(this.user());
    action.setItemObject(this.item());
    return this.itemTargetActors().some(function(target) {
        return action.testApply(target);
    }, this);
};

Scene_Menu.prototype.applyItem = function() {
    var action = new Game_Action(this.user());
    action.setItemObject(this.item());
    this.itemTargetActors().forEach(function(target) {
        for (var i = 0; i < action.numRepeats(); i++) {
            action.apply(target);
        }
    }, this);
    action.applyGlobal();
};

Scene_Menu.prototype.checkCommonEvent = function() {
    if ($gameTemp.isCommonEventReserved()) {
        SceneManager.goto(Scene_Map);
    }
};

//--------------------------------------------------------------------------------

Scene_Menu.prototype.newSave = function() {
    DataManager.loadAllSavefileImages();
    this.createHelpSaveWindow();
    this._helpWindow.refresh();
    this.createWolfWindow();

};


Scene_Menu.prototype.saveFileId = function() {
    return this._wolfWindow.index() + 1;
};

Scene_Menu.prototype.createWolfWindow = function() {
    var x = 115;
    var y = this._helpWindow.height + 20;
    var width = Graphics.boxWidth;
    var height = Graphics.boxHeight - y;
    this._wolfWindow = new Window_SaveWolf(x, y, 600, 500);
    this._wolfWindow.setHandler('ok',     this.onSaveFileOk.bind(this));
    this._wolfWindow.setHandler('cancel', this.closeSave.bind(this));
    this._wolfWindow.select(this.firstSaveFileIndex());
    this._wolfWindow.setTopRow(this.firstSaveFileIndex() - 2);
    this._wolfWindow.setMode(this.mode());
    this._wolfWindow.refresh();
    this.addWindow(this._wolfWindow);
};


Scene_Menu.prototype.helpWindowText = function() {
    return '';
};

Scene_Menu.prototype.firstSaveFileIndex = function() {
    return 0;
};

Scene_Menu.prototype.onSaveFileOk1 = function() {
};


Scene_Menu.prototype.mode = function() {
    return 'save';
};

Scene_Menu.prototype.helpWindowText = function() {
    return saveText;
};

Scene_Menu.prototype.firstSaveFileIndex = function() {
    return DataManager.lastAccessedSavefileId() - 1;
};

Scene_Menu.prototype.onSaveFileOk = function() {
    Scene_Menu.prototype.onSaveFileOk1.call(this);
    $gameSystem.onBeforeSave();
    if (DataManager.saveGame(this.saveFileId())) {
        this.onSaveSuccess();
    } else {
        this.onSaveFailure();
    }
    this._wolfWindow.refresh();
};

Scene_Menu.prototype.onSaveSuccess = function() {
    SoundManager.playSave();
    StorageManager.cleanBackup(this.saveFileId());
    this._wolfWindow.deactivate();
    this._wolfWindow.close();
    this._helpWindow.close();
    this._helpWindow.clear()
    this._commandWindow.activate();
};

Scene_Menu.prototype.onSaveFailure = function() {
    SoundManager.playBuzzer();
    this._wolfWindow.activate();
};

Scene_Menu.prototype.closeSave = function() {
    this._wolfWindow.deactivate();
    this._wolfWindow.close();
    this._helpWindow.close();
    this._commandWindow.activate();
};


//###############################################################################
//
// ITEM LIST
//
//###############################################################################

Gamefall.WolfMenu.oldItemListInitialize = Window_ItemList.prototype.initialize;
Window_ItemList.prototype.initialize = function(x, y, width, height) {
    Gamefall.WolfMenu.oldItemListInitialize.call(this, x, y, width, height);
    if(SceneManager._scene instanceof Scene_Menu) this.openness = 0;
};

Gamefall.WolfMenu.oldItemListMaxCols = Gamefall.WolfMenu.oldItemListMaxCols
Window_ItemList.prototype.maxCols = function() {
    if(!SceneManager._scene instanceof Scene_Menu) return Gamefall.WolfMenu.oldItemListMaxCols.call(this)
    return 2;
};

Gamefall.WolfMenu.oldItemListSpacing = Window_ItemList.prototype.spacing
Window_ItemList.prototype.spacing = function() {
    if(!SceneManager._scene instanceof Scene_Menu) return Gamefall.WolfMenu.oldItemListSpacing.call(this)
    return 48;
};

Gamefall.WolfMenu.oldIncludes = Window_ItemList.prototype.includes;
Window_ItemList.prototype.includes = function(item) {
    if(!SceneManager._scene instanceof Scene_Menu) Gamefall.WolfMenu.oldIncludes.call(this, item)
    if (this._category == 'all')
        return true;
    else
        return Gamefall.WolfMenu.oldIncludes.call(this, item);
};


//###############################################################################
//
// SAVE WOLF
//
//###############################################################################


function Window_SaveWolf() {
    this.initialize.apply(this, arguments);
}

Window_SaveWolf.prototype = Object.create(Window_Selectable.prototype);
Window_SaveWolf.prototype.constructor = Window_SaveWolf;

Window_SaveWolf.prototype.initialize = function(x, y, width, height) {
    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this._mode = null;
    this.openness = 0;
};

Window_SaveWolf.prototype.setMode = function(mode) {
    this._mode = mode;
};

Window_SaveWolf.prototype.maxItems = function() {
    return DataManager.maxSavefiles();
};

Window_SaveWolf.prototype.maxVisibleItems = function() {
    return 5;
};

Window_SaveWolf.prototype.itemHeight = function() {
    var innerHeight = this.height - this.padding * 2;
    return Math.floor(innerHeight / this.maxVisibleItems());
};

Window_SaveWolf.prototype.drawItem = function(index) {
    var id = index + 1;
    var valid = DataManager.isThisGameFile(id);
    var info = DataManager.loadSavefileInfo(id);
    var rect = this.itemRectForText(index);
    this.resetTextColor();
    if (this._mode === 'load') {
        this.changePaintOpacity(valid);
    }
    this.drawFileId(id, rect.x, rect.y);
    if (info) {
        this.changePaintOpacity(valid);
        this.drawContents(info, rect, valid);
        this.changePaintOpacity(true);
    }
};

Window_SaveWolf.prototype.drawFileId = function(id, x, y) {
    this.drawText(TextManager.file + ' ' + id, x, y, 180);
};

Window_SaveWolf.prototype.drawContents = function(info, rect, valid) {
    var bottom = rect.y + rect.height;
    if (rect.width >= 420) {
        if (valid) {
            this.drawPartyCharacters(info, rect.x + 220, bottom - 4);
        }
    }
    var lineHeight = this.lineHeight();
    var y2 = bottom - lineHeight;
    if (y2 >= lineHeight) {
        this.drawPlaytime(info, rect.x, y2, rect.width);
    }
};


Window_SaveWolf.prototype.drawPartyCharacters = function(info, x, y) {
    if (info.characters) {
        for (var i = 0; i < info.characters.length; i++) {
            var data = info.characters[i];
            this.drawCharacter(data[0], data[1], x + i * 48, y);
        }
    }
};

Window_SaveWolf.prototype.drawPlaytime = function(info, x, y, width) {
    if (info.playtime) {
        this.drawText(info.playtime, x, y, width, 'left');
    }
};

Window_SaveWolf.prototype.playOkSound = function() {
};



//###############################################################################
//
// WINDOW HELP
//
//###############################################################################

Gamefall.WolfMenu.oldHelpInitialize = Window_Help.prototype.initialize;
Window_Help.prototype.initialize = function(numLines) {
    Gamefall.WolfMenu.oldHelpInitialize.call(this, numLines);
    if(SceneManager._scene instanceof Scene_Menu) this.openness = 0;
};


//###############################################################################
//
// WINDOW ITEM DEF
//
//###############################################################################

function Window_ItemSpec() {
    this.initialize.apply(this, arguments);
}

Window_ItemSpec.prototype = Object.create(Window_Base.prototype);
Window_ItemSpec.prototype.constructor = Window_ItemSpec;

Window_ItemSpec.prototype.initialize = function(goldWindow) {
    this._goldWindow = goldWindow
    Window_Base.prototype.initialize.call(this, this._goldWindow.x, this._goldWindow.y - (this._goldWindow.height + 40), this._goldWindow.width, this.fittingHeight(2));
    this.openness = 0;
};

Window_ItemSpec.prototype.standardBackOpacity = function() {
    return 255;
};

Window_ItemSpec.prototype.refresh = function() {
    this.contents.clear();
    if(SceneManager._scene._forItem) {
        var item = $gameParty.lastItem();
        if(item !== null) {
            this.drawText(item.name, 0, 0, this.textWidth(item.name), 'left');
            this.drawText('Quant. x ' + String($gameParty.numItems(item)), 0, this.fittingHeight(0), this.textWidth('Quantity X' + String($gameParty.numItems(item))), 'left');
        }
        else return this.contents.clear();
    }
    if(SceneManager._scene._forSkill) {
        var skill = $dataSkills[SceneManager._scene._skillWindow._actor._lastMenuSkill._itemId];
        console.log(skill);
        if(skill !== null) {
            this.drawText(skill.name, 0, 0, this.textWidth(skill.name), 'left');
            var mp = skill.mpCost > 0 ? 'MP ' + String(skill.mpCost) : '';
            var tp = skill.tpCost > 0 ? 'TP ' + String(skill.tpCost) : '';
            var cost = mp + tp;
            console.log(cost);
            this.drawText('Cost: ' + cost, 0, this.fittingHeight(0), this.textWidth('Cost: ' + cost), 'left');           
        }
        else return this.contents.clear();
    }
};

//###############################################################################
//
// WINDOW SKILLLIST
//
//###############################################################################

Gamefall.WolfMenu.oldIncludesSkill = Window_SkillList.prototype.includes;
Window_SkillList.prototype.includes = function(item) {
    if(this._stypeId == 0) return true;
    else return Gamefall.WolfMenu.oldIncludesSkill.call(this, item);
};