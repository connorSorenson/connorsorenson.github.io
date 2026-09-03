---
layout:
  width: default
  title:
    visible: true
  description:
    visible: true
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: true
  metadata:
    visible: true
  tags:
    visible: true
  actions:
    visible: false
---

# New Orleans

To begin the CTF, I completed the tutorial level to familiarize myself with the web-based debugger, including the Disassembly and Live Memory Dump windows. I also reviewed the LockitPro documentation covering basic MSP430 assembly and debugger functionality.

### Observing Program Behavior

The New Orleans challenge presents a simple electronic lock protected by a password. I began by observing the program’s normal behavior before inspecting its implementation.

![](https://4066390816-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2Fnfvg4HLLwZ8TXAijFDY1%2Fuploads%2Fgit-blob-17bb8199accde7fd2ce04a1330faaad22a0fd45e%2Fone.png?alt=media)

After continuing, I can see the program exits through the debugger console. It is interesting to me that there is a checkbox to indicate hex encoded input to the password field. This will be useful in future levels when our solution includes a hex payload.

![](https://4066390816-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2Fnfvg4HLLwZ8TXAijFDY1%2Fuploads%2Fgit-blob-9106245648d18f5db57695d48a2e54765f3d3f1e%2Ftwo.png?alt=media)

After observing this behavior I next began to inspect the disassembly. Since this is the first challenge, and first blog post, I will lay out some of the documentation given.

```
Assembly programs are made of individual instructions. Instructions gen-
erally take the form: 

opcode source, destination

Where source and destination refer to registers, constants, or memory
locations. For example, one of the most common lines may read something
like this:

add #10, r15

Which simply means:
r15 = r15 + 10
```

### Understanding Main

Beginning at main `0x4438`, I can identify a few interesting functions: **check\_password** and **create\_password**.

Following the assembly in main the program gets the input from the user and makes a call (`0x4450`) to the **check\_password** function located at `0x44BC`. Before investigating the internal operations of that function let’s take a moment to understand the logic of the program.

![](https://4066390816-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2Fnfvg4HLLwZ8TXAijFDY1%2Fuploads%2Fgit-blob-7e274c06473fa75b21dac7889137bef57498daca%2Fthree.png?alt=media)

In step 1, the password input is captured from the user and moved to register 15. According to the MSP430 documentation, `r15` is a register used in function calls and can also be used to pass return values.

![](https://4066390816-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2Fnfvg4HLLwZ8TXAijFDY1%2Fuploads%2Fgit-blob-0c429bd6e9ef48a79df5a86508705be54b4be678%2Ffour.png?alt=media)

In step 2, the `check_password` function performs some check, which we haven’t investigated yet, against the entered password. After the `check_password` function has returned, a tst instruction is run. This compares the `r15` register with itself using a bitwise `AND` operation and uses the result to modify the value in the `zero flag`. This sequence is effectively checking if the value in `r15` is equal to 0 and storing the boolean result in a flag where the conditional jump can use it. This makes me guess that the return value from check\_password needs to be non-zero for us to unlock the lock.

In step 3, the jnz instruction executes if the `zero flag` is 0, or skips if the `zero flag` is 1 (where the last comparison in the tst instruction was `r15 == 0`). If it is not zero (`r15 != 0`), then the program jumps over the Invalid password logic and runs the instruction at `main+0x2a` (`0x4462`) to unlock the lock.

The call at `0x4450` ended up being the next step. I set a breakpoint here and ran the program.

![](https://4066390816-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2Fnfvg4HLLwZ8TXAijFDY1%2Fuploads%2Fgit-blob-9f0ebefeb9692f96186bbc98ee42318379726e67%2Ffive.png?alt=media)

### Analyzing check\_password

Once reaching the breakpoint I stepped into the **check\_password** function and identified the interesting cmp.b instruction.

![](https://4066390816-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2Fnfvg4HLLwZ8TXAijFDY1%2Fuploads%2Fgit-blob-5f461478ac6afad7590002378239ca1cffb6a24f%2Fsix.png?alt=media)

Essentially, leading up to the `cmp.b` instruction, the function adds `r14` to `r15` and places the result in `r13`. `r13` is then used as an address and the contents at its location in memory are compared with the contents at the `0x2400` location in memory. What does that mean in English? The password is compared with a value in another part of memory.

A pseudocode version in C would look like:

```c
int check_password(char *input)
{
    for (int i = 0; i < 8; i++)
    {
        if (input[i] != password[i])
            return 0;
    }

    return 1;
}
```

Using the values in the registers during debugging, and the hardcoded `0x2400` memory location, we can look for the value used to compare to the password.

![](https://4066390816-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2Fnfvg4HLLwZ8TXAijFDY1%2Fuploads%2Fgit-blob-f4e2bef9f1d248f8ebc6132e40de93c300ebb321%2Fseven.png?alt=media)

The `r14` register is set to 0. Since `r14` is added to `r13`, and `r14` is used as an index into `0x2400`, this tells us the index is 0 for both `r13` and `0x2400`.

So to recap as it stands:

* `r15` contains the starting address of the supplied password.
* `r14` functions as the byte index.
* `r13 = r15 + r14`, making `r13` point at the current byte of the supplied password.
* `0x2400(r14)` addresses the corresponding byte of the generated password.
* `cmp.b` compares those two bytes.

### Recovering the Password

Looking at the memory dump while running the program shows the password I input `test` at `0x439C`, and the hardcoded password bytes `2c3b 7d74 3330 4e00` at `0x2400`.

![](https://4066390816-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2Fnfvg4HLLwZ8TXAijFDY1%2Fuploads%2Fgit-blob-18a9536bcf157087245fb2b6043c5e1a6a43434f%2Feight.png?alt=media)

Now we know that in order to pass the check being performed our password must match the hardcoded one it is compared to. Since we know it is a byte comparison, we can simply use the bytes located at `0x2400` as our password.

![](https://4066390816-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2Fnfvg4HLLwZ8TXAijFDY1%2Fuploads%2Fgit-blob-1aeaa0d9f79e138a82aa4693610c14be0bca7098%2Fnine.png?alt=media)

Testing this password, we successfully solved the level.

![](https://4066390816-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2Fnfvg4HLLwZ8TXAijFDY1%2Fuploads%2Fgit-blob-5314eac09f3f2bb1abdbe5f9739d78ff5ab3bb7b%2Ften.png?alt=media)

### Security Takeaway

This level shows the importance of refraining from hardcoding credentials into your program. The program attempts to avoid storing the complete password directly in memory at initialization. You may have noticed that if you attempted to inspect the memory at `0x2400` before the **create\_password** function had been run you wouldn’t find the password in memory.

But by debugging the program and setting a breakpoint after that function sets the password, we can inspect the memory and find the password. Multiple runs of the program reveal the password is the same each time. This is clear when statically analyzing the **create\_password** function which contains each byte of the password and writes them one by one to the location in memory.

![](https://4066390816-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2Fnfvg4HLLwZ8TXAijFDY1%2Fuploads%2Fgit-blob-612a5e27b52e95abb37bb91d4f6012583b1ef39b%2Feleven.png?alt=media)

Even if an attacker couldn’t observe `0x2400`, static analysis of `create_password` reveals every byte.
