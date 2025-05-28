package com.example.contract_management_system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.contract_management_system.pojo.ContractState;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ContractStateMapper extends BaseMapper<ContractState> {
    @Select("SELECT conNum FROM contract_state WHERE type = #{type}")
    List<Integer> selectContractsByState(int type);
} 