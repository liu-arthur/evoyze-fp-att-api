if exists (select * from sys.objects where name = 'pr_att_dev_list')
begin drop procedure pr_att_dev_list end
go

create proc pr_att_dev_list (
	@current_uid nvarchar(255)

	, @is_in_use int
	, @show_status_only int = 0			--8-oct-18,lhw
	, @dev_group nvarchar(50)			--26-oct-19,lhw
	
	, @dev_id int = 0					--15-Aug-19,al
	, @ip_addr nvarchar(50) = null		--15-Aug-19,al

	, @co_id uniqueidentifier
	, @axn nvarchar(50)
	, @my_role_id int = 0				--'-999'-for interface program used.
	, @url nvarchar(255)

	, @is_debug int = 0
)
as
begin
/*#2100-0400-hrms-att-pr_att_dev_list

4-jul-18,lhw
- return clocking devices.



*/

	-- ================================================================
	-- init 
	-- ================================================================
	
	set nocount on

	-- ================================================================
	-- process
	-- ================================================================

	if @show_status_only = 1
	begin

	
		select 
			remarks
			, ip_addr = ip_addr + ':' + cast(port as nvarchar)
			, last_status = case when last_status is null then 'Unknonw' else last_status end
			, last_try_on
			, last_success_on

			, success_query_cnt
			, total_query
			
		from tb_att_device

		where
			is_in_use = 1
			and (
				len(isnull(@dev_group, '')) = 0
				or dev_group = @dev_group
			)

		order by
			ip_addr
		


	end
	else
	begin

		--15-Aug-24,al-
		if isnull(@my_role_id, 0) = -999
		begin 
			select *
			from tb_att_device
			where
				(
					len(isnull(@dev_id, -1)) = -1
					or hardware_dev_id = @dev_id
				)
				and (
					len(isnull(@dev_group, '')) = 0
					or dev_group = @dev_group
				)
				and (
					len(isnull(@ip_addr, '')) = 0
					or ip_addr = @ip_addr
				)
				and (
					isnull(@is_in_use, -1) = -1
					or is_in_use = @is_in_use
				)

		end
		else
		begin
			select 
				*

			from tb_att_device

			where
				(
					isnull(@is_in_use, -1) = -1
					or is_in_use = @is_in_use
				)
				and (
					len(isnull(@dev_group, '')) = 0
					or dev_group = @dev_group
				)

			order by
				hardware_dev_id
		end
		
	end

	-- ================================================================
	-- cleanup 
	-- ================================================================

	set nocount off

end
go