---
title: "starknet-scaffold-stark-1"
date: "2025-08-31"
---


# 一. 序言
## 什么是Scaffold-stark?
一个让你可以快速启动基于Starknet的去中心化应用的框架

PS：对于Starknet 初学者友好

## 1.  利用Scaffold-Stark开发Counter智能合约

- public 和 Private 函数
- 构造函数
- 事件
- Storage
- view和External函数


## 2.  利用Scaffold-Stark开发CrowdFund智能合约

- 合约之间的交互
- Mapping
- 常用函数

# 二. 开发环境的准备

scffold-stark-2 脚手架github地址
https://github.com/Scaffold-Stark/scaffold-stark-2

创建starknet 目录

```
mkdir starknet & cd starknet
```

拉取脚手架
```
git clone https://github.com/Scaffold-Stark/scaffold-stark-2.git
```
脚手架拉取完成
![Pasted-image-20250830162253.png](/images/Pasted-image-20250830162253.png)
使用vscode等开发IDE打开项目
我这里使用windsurf
```
windsurf .
```

项目目录如下
```
.
└── scaffold-stark-2
    ├── CONTRIBUTING.md
    ├── package.json
    ├── packages
    │   ├── nextjs
    │   └── snfoundry
    ├── README.md
    └── yarn.lock
```

1. 安装docker desktop 
	https://www.docker.com/

2. 在vscode 中安装插件 dev container
https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers

3. 使用vscode 打开scaffold-stark-2项目,  打开命令面板（Cmd+Shift+P / Ctrl+Shift+P），输入Dev Container 或者 reopen in Container，如下图
![Pasted-image-20250830180433.png](/images/Pasted-image-20250830180433.png)

可以看terminal 已经进入了docker环境
![Pasted-image-20250830180754.png](/images/Pasted-image-20250830180754.png)
在本地使用 docker ps

![Pasted-image-20250830181840.png](/images/Pasted-image-20250830181840.png)

这样我们就准备好了本地的开发环境


# 开发

在terminal中运行 yarn install
```
yarn install
```

完成
![Pasted-image-20250830182458.png](/images/Pasted-image-20250830182458.png)

运行在本地的环境，下面是yarn chain 语法
> To run a fork : `yarn chain --fork-network <URL> [--fork-block <BLOCK_NUMBER>]`
```
yarn chain
```

可以看到环境给我们生成了账户

![Pasted-image-20250830182701.png](/images/Pasted-image-20250830182701.png)

上面在docker中起到了一个本地starknet的环境，如果你想连接其他环境可以是配置文件 packages/nextjs/scaffold.config.ts

从新开启一个terminal，运行 yarn start
```
yarn start
```

![Pasted-image-20250830191435.png](/images/Pasted-image-20250830191435.png)

可以看到通过 http://localhost:3000 可以访问项目网站
![Pasted-image-20250830192244.png](/images/Pasted-image-20250830192244.png)

这时我们是没有看到项目中的合约

![Pasted-image-20250830192331.png](/images/Pasted-image-20250830192331.png)

这时可以运行`yarn deploy`部署本地的合约到docker 的starknet上
```bash
yarn deploy
```


![Pasted-image-20250830192520.png](/images/Pasted-image-20250830192520.png)

# 问题
---
##  yarn deploy 的时候报错
```bash
yarn deploy

   Compiling contracts v0.2.0 (/workspaces/scaffold-stark-2/packages/snfoundry/contracts/Scarb.toml)

error: Plugin diagnostic: `starknet::interface` functions must have a `self` parameter.

 --> /workspaces/scaffold-stark-2/packages/snfoundry/contracts/src/Counter.cairo:5:5

    fn increment();

    ^^^^^^^^^^^^^^

warn: Plugin diagnostic: Failed to generate ABI: Entrypoints must have a self first param.

 --> /workspaces/scaffold-stark-2/packages/snfoundry/contracts/src/Counter.cairo:9:1

#[starknet::contract]

^^^^^^^^^^^^^^^^^^^^^

  

error[E0004]: Not all trait items are implemented. Missing: 'increment'.

 --> /workspaces/scaffold-stark-2/packages/snfoundry/contracts/src/Counter.cairo:21:10

    impl Counter of ICounter<ContractState> {

         ^^^^^^^

error[E0002]: Method `read` not found on type `core::starknet::storage::storage_base::StorageBase::<core::integer::u256>`. Consider importing one of the following traits: `starknet::storage::StoragePointerReadAccess`.

 --> /workspaces/scaffold-stark-2/packages/snfoundry/contracts/src/Counter.cairo:23:26

            self.counter.read()

                         ^^^^
```

源代码如下：
```rust

#[starknet::interface]
trait ICounter<TContractState> {
    // view function
    fn get_count(self: @TContractState) -> u256;
    fn increment();
}

#[starknet::contract]
mod Counter {
    use super::ICounter;
    #[storage]
    struct Storage {
        counter: u256,
    }
    // public functions
    // increment and get_count
    #[abi(embed_v0)]
    impl Counter of ICounter<ContractState> {
        fn get_count(self: @ContractState) -> u256 {
            self.counter.read()
        }

        // fn increment(ref self: ContractState) {
        //     let current = self.counter.read();
        //     self.counter.write(current + 1_u256);
        // }
    }
}

```
1. #[starknet::interface] 里的函数必须有 self 参数
[error: Plugin diagnostic: `starknet::interface` functions must have a `self` parameter]
<details>
	我写的trait中increment没有加self：
	```rust
	fn increment();
	```
	接口方法必须明确 self，要么是 view (self: @TContractState)，要么是 mutable (ref self: TContractState)。
	正确写法如下：
	```rust
	fn increment(ref self: TContractState);
	```
</details>

2. impl 里必须实现所有接口方法
[ error E0004: Not all trait items are implemented. Missing: 'increment'.]
<details>
报错里提示 Missing: ‘increment’，说明你虽然在 trait 里声明了 increment，但在 impl 里没实现。
你注释掉的 increment 函数其实就是应该实现的。
</details>

3. read 和 ==write== 方法报错
[errorE0002: Method `read` not found on type ]
<details>
	错误信息：
	```
		Method `read` not found on type `core::starknet::storage::storage_base::StorageBase::<core::integer::u256>`
	```
	这是因为 read() / write() 方法需要 use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};。
	你没 use 导入，所以 read() / write() 不可用。
</details>

修改后代码：

```rust

#[starknet::interface]
trait ICounter<TContractState> {
    // view function
    fn get_count(self: @TContractState) -> u256;
    fn increment(ref self: TContractState);
}

#[starknet::contract]
mod Counter {
    use super::ICounter;
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};

    #[storage]
    struct Storage {
        counter: u256,
    }

    #[abi(embed_v0)]
    impl Counter of ICounter<ContractState> {
        fn get_count(self: @ContractState) -> u256 {
            self.counter.read()
        }

        fn increment(ref self: ContractState) {
            let current = self.counter.read();
            self.counter.write(current + 1_u256);
        }
    }
}
```

 总结代码的问题：
	1.	fn increment(); → 必须带 self。
	2.	impl 里少了 increment 的实现。
	3.	忘记 use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess}; 导入。



继续运行yarn deploy命令，还是有报错

![Pasted-image-20250831124306.png](/images/Pasted-image-20250831124306.png)

报错关键信息：
```bash
Killed
Error during deployment: Error: Command failed: cd contracts && scarb build ...
status: 137
```

在 Linux / Devcontainer 环境里，status: 137 几乎都是 内存不足 (OOM) 被系统 kill 掉。

也就是说，不是 Cairo 合约本身写错了，而是 scarb build 过程中编译器占用的内存太大，被容器或宿主机 kill 掉了。

那我们就查看容器内存配置

```bash
docker inspect 5b9e82ddb94e --format='{{.HostConfig.Memory}}'
```
![Pasted-image-20250831125006.png](/images/Pasted-image-20250831125006.png)

如果输出是 0，表示没有限制（容器能用宿主机所有可用内存）。所以应该问题不是内存问题

在contracts目录下单独构建
```bash
scarb build -vv
```
![Pasted-image-20250831125401.png](/images/Pasted-image-20250831125401.png)

完成了构建。 再尝试清理缓存
```bash
scarb clean
```

再次运行 yarn deploy

```bash
yarn deploy
```
![Pasted-image-20250831125658.png](/images/Pasted-image-20250831125658.png)
部署成功了
启动前端
```bash
yarn start
```
![Pasted-image-20250831130307.png](/images/Pasted-image-20250831130307.png)
访问本地 http://localhost:3000，查看页面我们的合约已经部署上链了

![Pasted-image-20250831130403.png](/images/Pasted-image-20250831130403.png)

