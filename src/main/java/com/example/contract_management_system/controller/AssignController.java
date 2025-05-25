@RestController
@RequestMapping("/api/contract")
public class AssignController {

    @Autowired
    private ContractService contractService;

    @GetMapping("/drafts")
    public List<Contract> getDraftContracts() {
        return contractService.getDraftContracts();
    }

    @PostMapping("/assign")
    public ResponseEntity<String> assignContract(@RequestBody AssignContractRequest request) {
        boolean success = contractService.assignContract(request);
        return success ? ResponseEntity.ok("分配成功") : ResponseEntity.badRequest().body("分配失败");
    }

    @GetMapping("/name")
    public Map<String, Object> getContractName(@RequestParam String id) {
        String name = contractService.getContractNameById(id);
        Map<String, Object> result = new HashMap<>();
        result.put("name", name != null ? name : "未知合同");
        return result;
    }

}
