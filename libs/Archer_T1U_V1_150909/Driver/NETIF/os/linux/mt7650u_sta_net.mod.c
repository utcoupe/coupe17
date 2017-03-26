#include <linux/module.h>
#include <linux/vermagic.h>
#include <linux/compiler.h>

MODULE_INFO(vermagic, VERMAGIC_STRING);

__visible struct module __this_module
__attribute__((section(".gnu.linkonce.this_module"))) = {
	.name = KBUILD_MODNAME,
	.init = init_module,
#ifdef CONFIG_MODULE_UNLOAD
	.exit = cleanup_module,
#endif
	.arch = MODULE_ARCH_INIT,
};

static const struct modversion_info ____versions[]
__used
__attribute__((section("__versions"))) = {
	{ 0x9d35aeec, __VMLINUX_SYMBOL_STR(module_layout) },
	{ 0x2d3385d3, __VMLINUX_SYMBOL_STR(system_wq) },
	{ 0x3356b90b, __VMLINUX_SYMBOL_STR(cpu_tss) },
	{ 0x61e836a8, __VMLINUX_SYMBOL_STR(RtmpDevPrivFlagsGet) },
	{ 0x754d539c, __VMLINUX_SYMBOL_STR(strlen) },
	{ 0xa1df5836, __VMLINUX_SYMBOL_STR(RTMPusecDelay) },
	{ 0x7ad6ac18, __VMLINUX_SYMBOL_STR(netif_carrier_on) },
	{ 0xf680d464, __VMLINUX_SYMBOL_STR(RtmpOSNetDevFree) },
	{ 0xe92a8028, __VMLINUX_SYMBOL_STR(netif_carrier_off) },
	{ 0xc9a035e3, __VMLINUX_SYMBOL_STR(RtmpOSNetDevDetach) },
	{ 0xeae3dfd6, __VMLINUX_SYMBOL_STR(__const_udelay) },
	{ 0x6c4836bf, __VMLINUX_SYMBOL_STR(RT_RateSize) },
	{ 0x4629334c, __VMLINUX_SYMBOL_STR(__preempt_count) },
	{ 0xda8441a6, __VMLINUX_SYMBOL_STR(rtstrchr) },
	{ 0x9e88526, __VMLINUX_SYMBOL_STR(__init_waitqueue_head) },
	{ 0x4f8b5ddb, __VMLINUX_SYMBOL_STR(_copy_to_user) },
	{ 0xb97a8d7, __VMLINUX_SYMBOL_STR(param_ops_charp) },
	{ 0x4c5ee785, __VMLINUX_SYMBOL_STR(RtmpOsSetNetDevPriv) },
	{ 0xd58277, __VMLINUX_SYMBOL_STR(netif_tx_wake_queue) },
	{ 0xcca0be3c, __VMLINUX_SYMBOL_STR(usb_deregister) },
	{ 0x2a8ef6f7, __VMLINUX_SYMBOL_STR(Rtmp_Drv_Ops_usb) },
	{ 0x27e1a049, __VMLINUX_SYMBOL_STR(printk) },
	{ 0x449ad0a7, __VMLINUX_SYMBOL_STR(memcmp) },
	{ 0xa1c76e0a, __VMLINUX_SYMBOL_STR(_cond_resched) },
	{ 0x7335685c, __VMLINUX_SYMBOL_STR(RtmpOSNetDevAttach) },
	{ 0x42160169, __VMLINUX_SYMBOL_STR(flush_workqueue) },
	{ 0x23811e26, __VMLINUX_SYMBOL_STR(module_put) },
	{ 0x9cd55864, __VMLINUX_SYMBOL_STR(os_free_mem) },
	{ 0xc375dec3, __VMLINUX_SYMBOL_STR(usb_get_dev) },
	{ 0xdb7305a1, __VMLINUX_SYMBOL_STR(__stack_chk_fail) },
	{ 0xc0f333fa, __VMLINUX_SYMBOL_STR(usb_put_dev) },
	{ 0xd62c833f, __VMLINUX_SYMBOL_STR(schedule_timeout) },
	{ 0x33ef9726, __VMLINUX_SYMBOL_STR(ralinkrate) },
	{ 0xbdfb6dbb, __VMLINUX_SYMBOL_STR(__fentry__) },
	{ 0x9f901ef6, __VMLINUX_SYMBOL_STR(RtmpOsGetNetDevPriv) },
	{ 0x2207a57f, __VMLINUX_SYMBOL_STR(prepare_to_wait_event) },
	{ 0x69acdf38, __VMLINUX_SYMBOL_STR(memcpy) },
	{ 0x757d9021, __VMLINUX_SYMBOL_STR(RTDebugLevel) },
	{ 0x39f5da0f, __VMLINUX_SYMBOL_STR(RTDebugFunc) },
	{ 0x2b626cd6, __VMLINUX_SYMBOL_STR(usb_register_driver) },
	{ 0x20adc8cd, __VMLINUX_SYMBOL_STR(os_alloc_mem) },
	{ 0xf08242c2, __VMLINUX_SYMBOL_STR(finish_wait) },
	{ 0x7b793024, __VMLINUX_SYMBOL_STR(RTMPFreeNdisPacket) },
	{ 0x76240b52, __VMLINUX_SYMBOL_STR(try_module_get) },
};

static const char __module_depends[]
__used
__attribute__((section(".modinfo"))) =
"depends=mt7650u_sta_util,mt7650u_sta";

MODULE_ALIAS("usb:v148Fp7610d*dc*dsc*dp*ic*isc*ip*in*");
MODULE_ALIAS("usb:v0E8Dp7610d*dc*dsc*dp*ic*isc*ip*in*");
MODULE_ALIAS("usb:v0E8Dp7630d*dc*dsc*dp*icFFisc02ipFFin*");
MODULE_ALIAS("usb:v0E8Dp7650d*dc*dsc*dp*icFFisc02ipFFin*");
MODULE_ALIAS("usb:v148Fp761Ad*dc*dsc*dp*ic*isc*ip*in*");
MODULE_ALIAS("usb:v2357p0105d*dc*dsc*dp*ic*isc*ip*in*");

MODULE_INFO(srcversion, "ACC8384DB3E5C841CFD92E8");
