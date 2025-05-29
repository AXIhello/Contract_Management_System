// 获取URL中的合同ID
const contractId = new URLSearchParams(window.location.search).get('id');

// TODO: 后端需要实现的接口
// GET /api/countersign/contract/{id}
// 请求参数：id (合同编号)
// 返回数据格式：
// {
//   "name": "合同名称"
// }
window.addEventListener('DOMContentLoaded', () => {
    if (contractId) {
        fetch(`/api/countersign/contract/${contractId}`)
            .then(res => res.json())
            .then(data => {
                document.getElementById('contractName').textContent = data.name || '未知合同';
            })
            .catch(err => {
                console.error('获取合同信息失败:', err);
                document.getElementById('contractName').textContent = '获取合同信息失败';
            });
    } else {
        document.getElementById('contractName').textContent = '未找到合同ID';
    }
});

// 重置表单
function resetForm() {
    document.getElementById('countersignComment').value = '';
    document.getElementById('errorMessage').style.display = 'none';
}

// TODO: 后端需要实现的接口
// POST /api/countersign/submit
// 请求参数：
// {
//   "contractId": "合同编号",
//   "comment": "会签意见"
// }
// 返回数据格式：
// {
//   "success": true/false,
//   "message": "成功/失败信息"
// }
function submitCountersign() {
    const comment = document.getElementById('countersignComment').value.trim();
    const errorMessage = document.getElementById('errorMessage');

    // 验证会签意见是否为空
    if (!comment) {
        errorMessage.style.display = 'block';
        return;
    }

    // 隐藏错误信息
    errorMessage.style.display = 'none';

    // 构建请求数据
    const requestData = {
        contractId: contractId,
        comment: comment
    };

    // 发送会签请求
    fetch('/api/countersign/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('会签提交成功！');
            // 提交成功后返回列表页
            window.location.href = '/countersignContract.html';
        } else {
            alert('会签提交失败：' + (data.message || '未知错误'));
        }
    })
    .catch(err => {
        console.error('提交会签失败:', err);
        alert('提交会签失败，请稍后重试');
    });
} 