Hooks.once("ready", () => {
    console.log("Armor Weight Reducer | Active");
    
    // Register module settings
    const armorTypes = ["light", "medium", "heavy", "shield"];
    const armorLabels = {
        "light": "Light Armor",
        "medium": "Medium Armor",
        "heavy": "Heavy Armor",
        "shield": "Shields"
    };
    
    game.settings.register("armor-weight-reducer", "defaultMultiplier", {
        name: "Default Weight Multiplier",
        hint: "Default multiplier for all armor types. Set to -1 to disable a type entirely.",
        scope: "world",
        config: true,
        type: Number,
        range: {
            min: -1,
            max: 1,
            step: 0.05
        },
        default: 0.5
    });
    
    // Register individual armor type multipliers
    armorTypes.forEach(type => {
        game.settings.register("armor-weight-reducer", `${type}Multiplier`, {
            name: `${armorLabels[type]} Multiplier`,
            hint: "Override default multiplier for this type. Set to -1 to use default.",
            scope: "world",
            config: true,
            type: Number,
            range: {
                min: -1,
                max: 1,
                step: 0.05
            },
            default: -1
        });
    });
    
    Hooks.on("updateItem", async (item, changes, options, userId) => {
        // Only run for equipment items
        if (item.type !== "equipment") return;
        if (options.skipWeightHook) return;
        
        const armorType = item.system.type?.value;
        if (!armorType) return;
        
        // Get multiplier for this armor type
        let weightMultiplier = game.settings.get("armor-weight-reducer", `${armorType}Multiplier`);
        
        // If set to -1, use default
        if (weightMultiplier === -1) {
            weightMultiplier = game.settings.get("armor-weight-reducer", "defaultMultiplier");
        }
        
        // If still -1 (default is disabled), skip this type
        if (weightMultiplier === -1) return;
        
        const originalWeight = item.getFlag("armor-weight-reducer", "originalWeight");
        
        // When armor is equipped
        if (changes.system?.equipped === true) {
            if (originalWeight === undefined) {
                await item.setFlag("armor-weight-reducer", "originalWeight", item.system.weight.value);
            }
            const baseWeight = originalWeight ?? item.system.weight.value;
            await item.update(
                {"system.weight.value": baseWeight * weightMultiplier}, 
                {skipWeightHook: true}
            );
        }
        // When armor is unequipped - restore original
        else if (changes.system?.equipped === false && originalWeight !== undefined) {
            await item.update(
                {"system.weight.value": originalWeight}, 
                {skipWeightHook: true}
            );
        }
    });
});