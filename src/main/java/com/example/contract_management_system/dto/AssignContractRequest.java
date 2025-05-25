public class AssignContractRequest {
    private int contractNum;
    private String signer;     // 签订人
    private String approver;   // 审批人
    private String cosigner;   // 会签人
    // 也可以改为 List<ContractProcess> 结构
}
