module.exports = function (bundler) {
  bundler.addAssetType('elmb', require.resolve('./ElmBundleAsset'));
}