Hooks.once("ready", () => {
    console.log("Armor Weight Reducer | Active");
    
    Hooks.on("updateItem", async (item, changes, options, userId) => {
        const armorTypes = ["light", "medium", "heavy"];
        
        if (item.type !== "equipment" || !armorTypes.includes(item.system.type?.value)) return;
        if (options.skipWeightHook) return;
        
        const originalWeight = item.getFlag("armor-weight-reducer", "originalWeight");
        
        if (changes.system?.equipped === true) {
            if (originalWeight === undefined) {
                await item.setFlag("armor-weight-reducer", "originalWeight", item.system.weight.value);
            }
            const baseWeight = originalWeight ?? item.system.weight.value;
            await item.update(
                {"system.weight.value": baseWeight / 2}, 
                {skipWeightHook: true}
            );
        }
        else if (changes.system?.equipped === false && originalWeight !== undefined) {
            await item.update(
                {"system.weight.value": originalWeight}, 
                {skipWeightHook: true}
            );
        }
    });
});