import axios from 'axios';

const API_BASE = 'http://localhost:5000';

console.log('\n' + '='.repeat(60));
console.log('🧪 豆包 API 测试套件');
console.log('='.repeat(60) + '\n');

async function runTests() {
  try {
    // 1. 健康检查
    console.log('1️⃣ 健康检查...');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ 服务状态:', health.data.status);
    console.log('   服务:', health.data.service);

    // 2. 获取根路径
    console.log('\n2️⃣ 获取 API 信息...');
    const root = await axios.get(`${API_BASE}/`);
    console.log('✅ 版本:', root.data.version);
    console.log('   支持端点数:', Object.keys(root.data.endpoints).length);

    // 3. 获取风格列表
    console.log('\n3️⃣ 获取支持的风格...');
    const stylesRes = await axios.get(`${API_BASE}/api/images/styles`);
    console.log(`✅ 获取到 ${stylesRes.data.count} 个风格`);
    stylesRes.data.data.forEach((s) => {
      console.log(`   ${s.emoji} ${s.name}`);
    });

    // 4. 获取尺寸列表
    console.log('\n4️⃣ 获取支持的尺寸...');
    const sizesRes = await axios.get(`${API_BASE}/api/images/sizes`);
    console.log('✅ 支持的尺寸:', sizesRes.data.sizes.join(', '));
    console.log('   默认尺寸:', sizesRes.data.default);

    // 5. 获取模型信息
    console.log('\n5️⃣ 获取模型信息...');
    const modelRes = await axios.get(`${API_BASE}/api/images/model-info`);
    console.log('✅ 模型:', modelRes.data.data.model);
    console.log('   文生图:', modelRes.data.data.capabilities.text_to_image ? '✅' : '❌');
    console.log('   批量生成:', modelRes.data.data.capabilities.batch_generation ? '✅' : '❌');
    console.log('   水印支持:', modelRes.data.data.capabilities.watermark_support ? '✅' : '❌');
    console.log('   支持风格:', modelRes.data.data.capabilities.styles_count);

    // 6. 生成单张图片
    if (process.env.ARK_API_KEY) {
      console.log('\n6️⃣ 生成单张图片...');
      const imageRes = await axios.post(`${API_BASE}/api/images/generate`, {
        prompt: '一只在月亮上漫步的宇航员',
        style: 'cyberpunk',
        size: '2K',
        watermark: false,
      });
      console.log('✅ 图片生成成功');
      console.log('   URL:', imageRes.data.data.image_url.substring(0, 80) + '...');
      console.log('   尺寸:', imageRes.data.data.size);
      console.log('   模型:', imageRes.data.data.model);
    } else {
      console.log('\n6️⃣ 生成单张图片...');
      console.log('⚠️ 跳过 (未配置 ARK_API_KEY)');
    }

    // 7. 测试其他风格
    console.log('\n7️⃣ 测试其他风格...');
    const testStyles = ['anime', 'oil_painting', 'watercolor'];
    for (const style of testStyles) {
      if (process.env.ARK_API_KEY) {
        try {
          const res = await axios.post(`${API_BASE}/api/images/generate`, {
            prompt: '美丽的日落风景',
            style: style,
            size: '1920x1920',
          });
          console.log(`   ✅ ${style}: 成功`);
        } catch (error) {
          console.log(`   ❌ ${style}: ${error.response?.data?.error || error.message}`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 所有测试完成！');
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    if (error.response) {
      console.error('   状态码:', error.response.status);
      console.error('   错误:', error.response.data);
    }
  }
}

runTests();
