module.exports = function (api) {
  api.cache(true);
  return {
    // zustand's ESM middleware reads import.meta.env, which breaks the web bundle unless it is transformed.
    presets: [['babel-preset-expo', { unstable_transformImportMeta: true }]],
  };
};
