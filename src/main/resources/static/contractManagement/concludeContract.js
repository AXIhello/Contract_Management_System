// // 已有附件数组，格式示例：[{id, name, url}]
// window.existingAttachments = [];
//
// // 页面初始化
// window.onload = async function () {
//     const contractId = new URLSearchParams(window.location.search).get("id");
//     if (!contractId) {
//         document.getElementById("errorMessage").innerText = "未提供合同 ID。";
//         return;
//     }
//
//     try {
//         // 获取合同信息
//         const response = await fetch(`/api/contract/concludeInfo/${contractId}`, {
//             method: 'GET',
//             credentials: 'include'
//         });
//
//         const result = await response.json();
//         if (!response.ok) {
//             if (result.code === 403) {
//                 throw new Error("权限不足，无法起草合同");
//             } else if (result.code === 401) {
//                 throw new Error("未登录或登录已过期，请重新登录");
//             } else {
//                 throw new Error(result.msg || "请求失败");
//             }
//         }
//
//         if (result.code !== 200) throw new Error(result.msg);
//         const contract = result.data;
//
//         // 填充合同基本信息
//         document.getElementById("contractName").value = contract.contractName || "";
//         document.getElementById("clientName").value = contract.customer || "";
//         document.getElementById("signerName").value = contract.signerName || "";
//         document.getElementById("contractInfo").value = contract.contractContent || "";
//         document.getElementById("beginTime").value = contract.beginTime?.split("T")[0] || "";
//         document.getElementById("endTime").value = contract.endTime?.split("T")[0] || "";
//
//         // 处理审批意见
//         const comments = contract.examineComments || [];
//         const commentList = document.getElementById("examineCommentsList");
//         commentList.innerHTML = "";
//         if (comments.length === 0) {
//             commentList.innerHTML = "<li>无</li>";
//         } else {
//             comments.forEach(comment => {
//                 const li = document.createElement("li");
//                 li.textContent = comment;
//                 commentList.appendChild(li);
//             });
//         }
//     } catch (err) {
//         console.error("加载合同失败", err);
//         document.getElementById("errorMessage").innerText = "加载合同失败：" + err.message;
//         return;
//     }
//
//     // 已有附件加载
//     await loadExistingAttachments(contractId);
// };
//
// // 获取已有附件
// async function loadExistingAttachments(contractId) {
//     try {
//         const res = await fetch(`/api/contract/attachment/get/${contractId}`, {
//             method: 'GET',
//             credentials: 'include',
//         });
//
//         const data = await res.json();
//         if (!res.ok) {
//             if (data.code === 403) {
//                 throw new Error("权限不足，无法获取附件");
//             } else if (data.code === 401) {
//                 throw new Error("未登录或登录已过期，请重新登录");
//             } else {
//                 throw new Error(data.msg || "请求失败");
//             }
//         }
//
//         if (!Array.isArray(data)) throw new Error("附件数据格式异常");
//
//         window.existingAttachments = data.map(item => ({
//             id: item.id || '',
//             name: item.fileName || '',
//             url: item.fileUrl || '',
//         }));
//
//         renderExistingAttachments();
//     } catch (err) {
//         console.error("加载已有附件失败", err);
//         const container = document.getElementById('existingAttachmentsContainer');
//         if (container) container.innerHTML = '<p style="color:red;">加载附件失败：' + err.message + '</p>';
//     }
// }
//
// // 渲染已有附件列表
// function renderExistingAttachments() {
//     const container = document.getElementById('existingAttachmentsContainer');
//     if (!container) return;
//     container.innerHTML = '';
//
//     if (window.existingAttachments.length === 0) {
//         container.innerHTML = '<p>无已上传附件</p>';
//         return;
//     }
//
//     window.existingAttachments.forEach((file, idx) => {
//         const div = document.createElement('div');
//         div.className = 'attachment-item';
//         div.style.display = 'flex';
//         div.style.justifyContent = 'space-between';
//         div.style.alignItems = 'center';
//         div.style.padding = '8px';
//         div.style.border = '1px solid #ddd';
//         div.style.marginBottom = '5px';
//
//         // 文件信息
//         const fileInfo = document.createElement('span');
//         fileInfo.textContent = file.name;
//         fileInfo.style.flex = '1';
//
//         // 下载链接
//         const downloadBtn = document.createElement('a');
//         downloadBtn.href = `/api/contract/attachment/download?filepath=${encodeURIComponent(file.url)}`;
//         downloadBtn.textContent = '下载';
//         downloadBtn.target = '_blank';
//         downloadBtn.rel = 'noopener noreferrer';
//         downloadBtn.style.marginRight = '10px';
//         downloadBtn.style.color = '#007bff';
//         downloadBtn.style.textDecoration = 'none';
//
//         div.appendChild(fileInfo);
//         div.appendChild(downloadBtn);
//         container.appendChild(div);
//     });
// }
//
// // 设置输入框加载状态
// function setInputsLoading(isLoading) {
//     const editableSelectors = ['#signInfo', 'button[type="submit"]'];
//     editableSelectors.forEach(selector => {
//         const elements = document.querySelectorAll(selector);
//         elements.forEach(element => {
//             element.disabled = isLoading;
//             element.style.opacity = isLoading ? '0.7' : '1';
//             element.style.cursor = isLoading ? 'not-allowed' : (element.type === 'button' ? 'pointer' : 'auto');
//         });
//     });
// }
//
// // 重置表单
// function resetForm() {
//     document.getElementById('signInfo').value = '';
//     document.getElementById('errorMessage').innerText = '';
//     const contractId = new URLSearchParams(window.location.search).get("id");
//     if (contractId) {
//         loadExistingAttachments(contractId);
//     }
// }
//
// // 表单提交
// const form = document.getElementById('signContractForm');
// if (form) {
//     form.addEventListener('submit', async function (e) {
//         e.preventDefault();
//         const errorMessage = document.getElementById('errorMessage');
//         if (errorMessage) errorMessage.innerText = '';
//
//         setInputsLoading(true);
//
//         const contractId = new URLSearchParams(window.location.search).get("id");
//         if (!contractId) {
//             if (errorMessage) errorMessage.innerText = '合同ID不能为空';
//             setInputsLoading(false);
//             return;
//         }
//
//         const signInfo = document.getElementById('signInfo').value.trim();
//         if (!signInfo) {
//             if (errorMessage) errorMessage.innerText = '签订信息不能为空';
//             setInputsLoading(false);
//             return;
//         }
//
//         try {
//             const formData = new FormData();
//             formData.append('contractId', contractId);
//             formData.append('signInfo', signInfo);
//
//             const res = await fetch('/api/contract/submitSignInfo', {
//                 method: 'POST',
//                 body: formData,
//                 credentials: 'include'
//             });
//
//             const result = await res.json();
//             if (!res.ok) {
//                 if (result.code === 403) {
//                     throw new Error("权限不足，无法提交签订信息");
//                 } else if (result.code === 401) {
//                     throw new Error("未登录或登录已过期，请重新登录");
//                 } else {
//                     throw new Error(result.msg || "请求失败");
//                 }
//             }
//
//             if (result.code !== 200) {
//                 throw new Error(result.msg || '提交失败');
//             }
//
//             alert('签订信息提交成功！');
//             window.location.href = '/contracts/list';
//
//         } catch (err) {
//             console.error("提交失败", err);
//             if (errorMessage) errorMessage.innerText = "提交失败：" + err.message;
//         } finally {
//             setInputsLoading(false);
//         }
//     });
// }

// 已有附件数组，格式示例：[{id, name, url}]
window.existingAttachments = [];

document.addEventListener("DOMContentLoaded", () => {
    const contractId = new URLSearchParams(window.location.search).get("id");
    if (!contractId) {
        document.getElementById("finalError").innerText = "未提供合同 ID。";
        return;
    }

    // 获取合同结项信息
    fetch(`/api/contract/concludeInfo/${contractId}`, {
        method: 'GET',
        credentials: 'include',
    })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) {
                if (data.code === 403) throw new Error("权限不足，无法访问该资源");
                if (data.code === 401) throw new Error("未登录或登录已过期，请重新登录");
                throw new Error(data.msg || "请求失败");
            }
            return data;
        })
        .then((data) => {
            document.getElementById("contractName").value = data.contractName || "";
            document.getElementById("clientName").value = data.customer || "";
            document.getElementById("signerName").value = data.signerName || "";
            document.getElementById("contractInfo").value = data.contractContent || "";
            document.getElementById("beginTime").value = data.beginTime?.split("T")[0] || "";
            document.getElementById("endTime").value = data.endTime?.split("T")[0] || "";
            // 🔽 修改这里，把审批意见插入 <ul>
            const commentsUl = document.getElementById("examineComments");
            commentsUl.innerHTML = ""; // 清空原有内容
            if (data.examineComments) {
                commentsUl.innerHTML = `<li>${data.examineComments}</li>`;
            }
//
            setFieldsReadonly();
        })
        .catch((error) => {
            console.error("获取结项信息失败:", error);
            alert(error.message);
        });

    // 获取附件
    fetch(`/api/contract/attachment/get/${contractId}`)
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) {
                if (data.code === 403) throw new Error("权限不足，无法查看附件");
                if (data.code === 401) throw new Error("未登录或登录已过期，请重新登录");
                throw new Error(data.msg || "请求失败");
            }
            return data;
        })
        .then((attachments) => {
            if (!Array.isArray(attachments)) throw new Error("附件数据格式异常");

            window.existingAttachments = attachments.map(item => ({
                id: item.id || '',
                name: item.fileName || '',
                url: item.fileUrl || '',
            }));

            renderAttachments();
        })
        .catch((error) => {
            console.error("获取附件失败:", error);
            document.getElementById("attachmentsList").innerHTML =
                `<li><span style='color: red;'>${error.message}</span></li>`;
        });

    // 渲染附件
    function renderAttachments() {
        const container = document.getElementById('attachmentsList');
        if (!container) return;

        container.innerHTML = '';

        if (window.existingAttachments.length === 0) {
            container.innerHTML = '<li><span>无已上传附件</span></li>';
            return;
        }

        window.existingAttachments.forEach(file => {
            const li = document.createElement('li');
            li.className = 'attachment-item';

            const fileInfo = document.createElement('span');
            fileInfo.textContent = file.name;

            const downloadBtn = document.createElement('a');
            downloadBtn.href = `/api/contract/attachment/download?filepath=${encodeURIComponent(file.url)}`;
            downloadBtn.textContent = '下载';
            downloadBtn.target = '_blank';
            downloadBtn.rel = 'noopener noreferrer';
            downloadBtn.style.color = '#007bff';
            downloadBtn.style.textDecoration = 'none';

            li.appendChild(fileInfo);
            li.appendChild(downloadBtn);
            container.appendChild(li);
        });
    }

    // 提交结项
    document.getElementById("concludeForm").addEventListener("submit", (e) => {
        e.preventDefault();

        const comments = document.getElementById("concludeComments").value.trim();

        if (comments === "") {
            alert("请填写结项说明");
            return;
        }

        const payload = {
            contractId,
            concludeOpinion: comments,
        };

        fetch(`/api/contract/submitSign`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) {
                    if (data.code === 403) throw new Error("权限不足，无法签订合同");
                    if (data.code === 401) throw new Error("未登录或登录已过期，请重新登录");
                    throw new Error(data.msg || "请求失败");
                }
                return data;
            })
            .then(() => {
                alert("结项提交成功！");
                window.location.href = "/queryAndStatistics/searchContractList.html";
            })
            .catch((error) => {
                console.error("结项提交失败:", error);
                alert(error.message);
            });
    });

    // 重置按钮
    document.getElementById("resetBtn").addEventListener("click", () => {
        const checkedRadio = document.querySelector('input[name="concludeResult"]:checked');
        if (checkedRadio) checkedRadio.checked = false;
        document.getElementById("concludeComments").value = "";
    });
});
