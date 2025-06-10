package com.example.contract_management_system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.contract_management_system.pojo.Contract;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface ContractMapper extends BaseMapper<Contract> {

//    @Update("UPDATE contract SET state = #{state} WHERE num = #{contractId}")
//    int updateContractState(@Param("contractId") Integer contractId, @Param("state") Integer state);

    @Select("SELECT name FROM contract WHERE num = #{num}")
    String findContractNameById(int num);
}

