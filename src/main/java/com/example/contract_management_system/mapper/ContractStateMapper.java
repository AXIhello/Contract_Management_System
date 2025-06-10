package com.example.contract_management_system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.contract_management_system.pojo.ContractState;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.sql.Timestamp;
import java.util.List;
import java.util.Map;

@Mapper
public interface ContractStateMapper extends BaseMapper<ContractState> {

    @Select("SELECT conNum FROM contract_state WHERE type = #{type}")
    List<Integer> selectContractsByState(int type);

    @Update("UPDATE contract_state " +
            "SET type = #{type}, time = #{time} " +
            "WHERE conNum = #{contractId} AND type = #{oldType}")
    int updateContractState(@Param("contractId") Integer contractId,
                            @Param("type") Integer type,
                            @Param("oldType") Integer oldType,
                            @Param("time") Timestamp time);

    /**
     * 根据用户ID获取待处理的合同信息
     * 替代原来的 selectPendingByUserId 方法
     * 根据 contract_state 的 type 来判断当前阶段，然后匹配相应的待处理任务
     */
    @Select("SELECT DISTINCT cs.conNum, cs.type as stateType, " +
            "CASE " +
            "  WHEN cs.type = 1 AND cp.type = 1 AND cp.state = 0 AND cp.user_id = #{userId} THEN 'COUNTERSIGN' " +
            "  WHEN cs.type = 2 AND c.user_id = #{userId} THEN 'DRAFT' " +
            "  WHEN cs.type = 3 AND cp.type = 2 AND cp.state = 0 AND cp.user_id = #{userId} THEN 'EXAMINE' " +
            "  WHEN cs.type = 4 AND cp.type = 3 AND cp.state = 0 AND cp.user_id = #{userId} THEN 'CONCLUDE' " +
            "END as taskType " +
            "FROM contract_state cs " +
            "LEFT JOIN contract_process cp ON cs.conNum = cp.conNum " +
            "LEFT JOIN contract c ON cs.conNum = c.num " +
            "WHERE " +
            "  (cs.type = 1 AND cp.type = 1 AND cp.state = 0 AND cp.user_id = #{userId}) OR " +
            "  (cs.type = 2 AND c.user_id = #{userId}) OR " +
            "  (cs.type = 3 AND cp.type = 2 AND cp.state = 0 AND cp.user_id = #{userId}) OR " +
            "  (cs.type = 4 AND cp.type = 3 AND cp.state = 0 AND cp.user_id = #{userId})")
    List<Map<String, Object>> selectPendingByUserId(@Param("userId") Integer userId);
}