Hooks.once("ready", () => {
    
    Hooks.on("updateItem", async (item, changes, options, userId) => {
        if (item.type !== "equipment" || item.system.type?.value !== "armor") return;
        
        if (changes.system?.equipped === true && !options.skipWeightHook) {
            const originalWeight = item.system.weight.value;
            await item.update(
                {"system.weight.value": originalWeight / 2}, 
                {skipWeightHook: true}
            );
        }
        else if (changes.system?.equipped === false && !options.skipWeightHook) {
            const currentWeight = item.system.weight.value;
            await item.update(
                {"system.weight.value": currentWeight * 2}, 
                {skipWeightHook: true}
            );
        }
    });
});