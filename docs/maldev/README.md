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
    visible: false
  metadata:
    visible: true
  tags:
    visible: true
  actions:
    visible: false
  anchors:
    visible: true
---

# MalDev

**Malware Development**

<p align="right">Exploring Windows internals, execution techniques, process manipulation, and defensive detection through hands-on research.</p>

<sup><sub><mark style="color:red;">|<mark style="color:red;"><sub></sup> Research Areas

{% tabs %}
{% tab title="Malware" icon="rectangle-terminal" %}
<mark style="color:$info;">Services, PEs, DLLs, Packing and more!</mark> <a href="malware/" class="button secondary medium" data-icon="bug">Explore -></a>
{% endtab %}

{% tab title="Process Injection" icon="syringe" %}
<mark style="color:$info;">Remote Injection, APC, TLS Callbacks, Section View Mapping</mark><a href="./#process-injection" class="button secondary medium" data-icon="syringe">Explore -></a>
{% endtab %}

{% tab title="Evasion" icon="user-ninja" %}
<mark style="color:$info;">Usermode (Unhooking, syscalls, file attributes, ROP chains)</mark>&#x20;

<mark style="color:$info;">Kernel (Minifilters, Callback Objects, UEFI Boot/Root-Kits)</mark><a href="evasion.md" class="button secondary medium" data-icon="popcorn">Explore -></a>
{% endtab %}

{% tab title="Internals" icon="diagram-next" %}
<mark style="color:$info;">File Format, Data Structures, CFI/CET, Shadow Stacks</mark> <a href="internals.md" class="button secondary medium" data-icon="gear-code">Explore -></a>
{% endtab %}

{% tab title="API Space" %}
<mark style="color:$info;">Open/Create, Transfer Code, Execute Code</mark> <a href="./" class="button secondary medium" data-icon="rectangle-api">Explore -></a>
{% endtab %}
{% endtabs %}

<sup><sub><mark style="color:red;">|<mark style="color:red;"><sub></sup> Latest&#x20;

<table data-view="cards"><thead><tr><th></th><th data-hidden data-card-target data-type="content-ref"></th><th data-hidden data-card-cover data-type="image">Cover image</th></tr></thead><tbody><tr><td><sup><em><mark style="color:$info;">Learn how to write a Windows Service Executable</mark></em></sup></td><td><a href="malware/turning-a-c2-stager-into-a-windows-service-executable.md">turning-a-c2-stager-into-a-windows-service-executable.md</a></td><td data-object-fit="contain"><a href="../../.gitbook/assets/c2 image.png">c2 image.png</a></td></tr></tbody></table>

