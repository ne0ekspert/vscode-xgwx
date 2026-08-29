export function groupModuleOptions(visibleOptions) {
  const options = Array.isArray(visibleOptions) ? visibleOptions : [];
  const hasMultipleChannels = options.some((option) => (
    option.scope === "channel" && Number(option.count) > 1
  ));
  const groups = new Map();

  options.forEach((option) => {
    const count = Number.isInteger(option.count) && option.count > 0 ? option.count : 0;
    for (let index = 0; index < count; index += 1) {
      const isChannelGroup = hasMultipleChannels && option.scope === "channel";
      const section = option.section || "";
      const key = isChannelGroup
        ? `channel:${section}:${index}`
        : `section:${section}`;
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          section,
          channelIndex: isChannelGroup ? index : null,
          items: [],
        });
      }
      groups.get(key).items.push({ option, index, groupedByChannel: isChannelGroup });
    }
  });

  return [...groups.values()];
}
