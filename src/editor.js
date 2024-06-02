// 创建一个editor 可编辑内容的 div
export default () => {
    const editorElement = document.createElement('div');
    editorElement.id = 'editor';
    editorElement.className = 'editor';
    editorElement.contentEditable = true;
    console.log('editor init complement');
    return editorElement;
    console.log('测试tree shaking 功能 是否检测到我这无用的代码！！！');
}

