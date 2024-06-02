import TestHTML from '@/pages/test.html';
//自制loader
import study from '@/assets/file/webpackstudy.md'
//引入图片
import icon from '@/assets/images/test.png';
// 引入css  测试测试注释是否隐藏
import "@/assets/css/index.css";
import createEditor from "@/editor";

const div = document.createElement('div');
div.innerHTML = TestHTML;
document.body.appendChild(div);
const divtwo = document.createElement('div');
divtwo.innerHTML = study;
document.body.appendChild(divtwo);
const img = new Image();
img.src = icon;
document.body.appendChild(img);

//页面中加入此dom
const editor = createEditor();
document.body.appendChild(editor);

if (module.hot) {
    let lastEditor = editor;
  //热更新api webpack监听js模块热更新 进行热更新 当editor变化时候进行热更新
    module.hot.accept('@/editor', () => {
        console.log('change editor!!');
        const value = lastEditor.innerHTML;
        document.body.removeChild(lastEditor);
        const newEditor = createEditor();
        document.body.appendChild(newEditor);
        newEditor.innerHTML = value;
        lastEditor = editor;
    })
  //图片热替换检测  监测图片变化 替换图片
    module.hot.accept('@/assets/images/test.png', () => {
        img.src = icon;
    })
}
//测试defineplugin变量定义
console.log(API_BASE_URL);



