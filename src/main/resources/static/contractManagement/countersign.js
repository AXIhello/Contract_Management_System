// 获取URL中的合同ID
const contractId = new URLSearchParams(window.location.search).get('id');

// 格式化日期函数
function formatDate(dateString) {
    if (!dateString) return '未知日期';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
}

window.addEventListener('DOMContentLoaded', () => {
    if (contractId) {
        fetch(`/api/countersign/contract/${contractId}`)
            .then(res => res.json())
            .then(data => {
                document.getElementById('contractName').textContent = data.name || '未知合同';
                document.getElementById('contractNum').textContent = data.num || '未知编号';
                document.getElementById('beginTime').textContent = formatDate(data.beginTime);
                document.getElementById('endTime').textContent = formatDate(data.endTime);
                document.getElementById('userId').textContent = data.userId || '未知';
                document.getElementById('customer').textContent = data.customer || '未知';

                // 处理附件
                const attachmentsElement = document.getElementById('attachments');
                if (data.attachments && data.attachments.length > 0) {
                    attachmentsElement.innerHTML = '';
                    data.attachments.forEach(attachment => {
                        const attachmentItem = document.createElement('div');
                        attachmentItem.className = 'attachment-item';
                        attachmentItem.innerHTML = `
                            <span>${attachment.name}</span>
                            <a href="${attachment.url}" target="_blank" download>下载</a>
                        `;
                        attachmentsElement.appendChild(attachmentItem);
                    });
                } else {
                    attachmentsElement.textContent = '无附件';
                }

                // 处理合同内容
                const contentElement = document.getElementById('contractContent');
                if (data.content) {
                    contentElement.innerHTML = data.content;
                } else {
                    contentElement.textContent = '合同内容为空';
                }
            })
            .catch(err => {
                console.error('获取合同信息失败:', err);
                document.getElementById('contractName').textContent = '获取合同信息失败';
                document.getElementById('contractNum').textContent = '获取合同信息失败';
                document.getElementById('beginTime').textContent = '获取合同信息失败';
                document.getElementById('endTime').textContent = '获取合同信息失败';
                document.getElementById('userId').textContent = '获取合同信息失败';
                document.getElementById('customer').textContent = '获取合同信息失败';
                document.getElementById('attachments').textContent = '获取附件信息失败';
                document.getElementById('contractContent').textContent = '获取合同内容失败';
            });
    } else {
        document.getElementById('contractName').textContent = '未找到合同ID';
        document.getElementById('contractNum').textContent = '未找到合同ID';
        document.getElementById('beginTime').textContent = '未找到合同ID';
        document.getElementById('endTime').textContent = '未找到合同ID';
        document.getElementById('userId').textContent = '未找到合同ID';
        document.getElementById('customer').textContent = '未找到合同ID';
        document.getElementById('attachments').textContent = '未找到合同ID';
        document.getElementById('contractContent').textContent = '未找到合同ID';
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
                window.location.href = '/toBeCountersignedContractList.html';
            } else {
                alert('会签提交失败：' + (data.message || '未知错误'));
            }
        })
        .catch(err => {
            console.error('提交会签失败:', err);
            alert('提交会签失败，请稍后重试');
        });
}