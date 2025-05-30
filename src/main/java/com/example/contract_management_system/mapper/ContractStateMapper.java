package com.example.contract_management_system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.contract_management_system.pojo.ContractState;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.sql.Timestamp;
import java.util.List;

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
} 