//引入图片
//这里是公共部分-- 测试打包提取公共模块
import createEditor from "@/editor";
import icon from '@/assets/images/test.png';
// 引入css
import "@/assets/css/index.css";

const img = new Image();
img.src = icon;
document.body.appendChild(img);
//这里是公共部分-- 测试打包提取公共模块
alert('this is hello——hello world!');
