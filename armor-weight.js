Hooks.once("ready", () => {
    console.log("Armor Weight Reducer | Active");
    
    // Register module settings
    game.settings.register("armor-weight-reducer", "armorTypes", {
        name: "Armor Types",
        hint: "Which armor types to modify (comma-separated: light, medium, heavy, shield)",
        scope: "world",
        config: true,
        type: String,
        default: "light,medium,heavy,shield"
    });
    
    game.settings.register("armor-weight-reducer", "weightMultiplier", {
        name: "Weight Multiplier",
        hint: "Multiply equipped armor weight by this value. 0.5 = half weight, 0.25 = quarter weight, 0 = no weight.",
        scope: "world",
        config: true,
        type: Number,
        range: {
            min: 0,
            max: 1,
            step: 0.05
        },
        default: 0.5
    });
    
    Hooks.on("updateItem", async (item, changes, options, userId) => {
        // Only run for equipment items
        if (item.type !== "equipment") return;
        if (options.skipWeightHook) return;
        
        // Check if this armor type is enabled
        const armorType = item.system.type?.value;
        const enabledTypes = game.settings.get("armor-weight-reducer", "armorTypes")
            .split(",")
            .map(t => t.trim());
        
        if (!enabledTypes.includes(armorType)) return;
        
        const weightMultiplier = game.settings.get("armor-weight-reducer", "weightMultiplier");
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