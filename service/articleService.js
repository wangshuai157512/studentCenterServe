const articleReplace = function(item) {
    const completeItem = item.replace(/\"/g,'');
    const newItem = completeItem.replace(': ',':');
    return newItem;
};
const audioUrlReplace = function(item) {
    const completeItem = item.replace(/public/, '');
    const newItem = completeItem.replace(/\\/g,'/');
    return newItem;
}
module.exports = {
    articleReplace: articleReplace,
    audioUrlReplace: audioUrlReplace
};