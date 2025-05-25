package com.example.contract_management_system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.contract_management_system.pojo.Contract;


public interface ContractMapper extends BaseMapper<Contract> {
    List<Contract> selectContractsByState(int type);

    void insertContractProcess(@Param("conNum") int conNum,
                               @Param("type") int type,
                               @Param("state") int state,
                               @Param("userName") String userName);

    void updateContractState(@Param("conNum") int conNum, @Param("type") int type);

    @Select("SELECT name FROM contract WHERE id = #{id}")
    String findContractNameById(@Param("id") String id);
}

