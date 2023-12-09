const sample_data = {
  headers: [
    { name: 'Delivered-To', value: 'isahsaidu308@gmail.com' },
    {
      name: 'Received',
      value: 'by 2002:a05:6918:5da3:b0:1a5:6843:1a9f with SMTP id iu35csp20870ysb;        Mon, 30 Oct 2023 13:10:38 -0700 (PDT)'
    },
    {
      name: 'X-Received',
      value: 'by 2002:ac2:4e15:0:b0:4ff:839b:5355 with SMTP id e21-20020ac24e15000000b004ff839b5355mr225728lfr.18.1698696637971;        Mon, 30 Oct 2023 13:10:37 -0700 (PDT)'
    },
    {
      name: 'ARC-Seal',
      value: 'i=1; a=rsa-sha256; t=1698696637; cv=none;        d=google.com; s=arc-20160816;        b=nbWpSa82yKIMIYvAIJzuLF4ZZY+A93rSLnVAvWnS0VGoPwNBnXXDLkC5jXpkOA/vS7         TzFSyow7ctMBmwndwt05+quJ1XY2w6Gc1FOvwGO92moIn0htiz+OB9T0+8ltuUnetBEm         42iiBVZ71rXCzXS8xr+fnK6FAip6rj5SjqAG7CFBaJgnGsKeazW4fBgHpoEoSJd9i1qU         VET6UpFqgdp3cOITPGreS+ol9bMCKIvirLj/ECDaP6cYN9MpgL72CI7rSJk9YUd4fiY0         6L/VzlhqOQRftCWvb5nmrXAzcWjK5VKQL2gOG0jIizCR3ugFRLJd/NIGy3dakXlZudhC         L+7A=='
    },
    {
      name: 'ARC-Message-Signature',
      value: 'i=1; a=rsa-sha256; c=relaxed/relaxed; d=google.com; s=arc-20160816;        h=to:subject:message-id:date:from:mime-version:dkim-signature;        bh=aLIh+WCg9J8NyrxMmzl2FoXIzZbAFd/v9gG9TVjJT3U=;        fh=W/7We2EQfPIGdNwGYXJCRdRGXatP74ySfWHAOJ6sWaI=;        b=mjVKgGf2Lvs5Smam0dUfeasUq0nxvWcpBhLxmelS4fa9y4ZpQDofZQZey9+UD/7rOj         jFeXg/YuRGzFPXjzH4zGnCpNpuToEXekyurC+K8L6ai9PT2xHX1od+ASawB7/OUXrusq         4M1zpwolaY2AGCNZtoTovdpDD8nUEQ/jnj0RvmsPSmyKMVUs3qO5/bW7E6d4W994fAJu         EhtPARd21EXsJylM140fyaKT+20vdXSsiHkQczUskhccLtQlHH/3As4k0/N4D2XwyO9B         NhiUdn2jtyKNW+GrimqF8cnc5bQeEI+qMkYsL0wbyAyoBeYFa2/sWaZWdC28GuXccNYJ         NgfQ=='
    },
    {
      name: 'ARC-Authentication-Results',
      value: 'i=1; mx.google.com;       dkim=pass header.i=@gmail.com header.s=20230601 header.b=OP0htxsR;       spf=pass (google.com: domain of eesahsaeed@gmail.com designates 209.85.220.41 as permitted sender) smtp.mailfrom=eesahsaeed@gmail.com;       dmarc=pass (p=NONE sp=QUARANTINE dis=NONE) header.from=gmail.com'
    },
    { name: 'Return-Path', value: '<eesahsaeed@gmail.com>' },
    {
      name: 'Received',
      value: 'from mail-sor-f41.google.com (mail-sor-f41.google.com. [209.85.220.41])        by mx.google.com with SMTPS id k38-20020a0565123da600b00507a3b16fe6sor1693298lfv.2.2023.10.30.13.10.37        for <isahsaidu308@gmail.com>        (Google Transport Security);        Mon, 30 Oct 2023 13:10:37 -0700 (PDT)'
    },
    {
      name: 'Received-SPF',
      value: 'pass (google.com: domain of eesahsaeed@gmail.com designates 209.85.220.41 as permitted sender) client-ip=209.85.220.41;'
    },
    {
      name: 'Authentication-Results',
      value: 'mx.google.com;       dkim=pass header.i=@gmail.com header.s=20230601 header.b=OP0htxsR;       spf=pass (google.com: domain of eesahsaeed@gmail.com designates 209.85.220.41 as permitted sender) smtp.mailfrom=eesahsaeed@gmail.com;       dmarc=pass (p=NONE sp=QUARANTINE dis=NONE) header.from=gmail.com'
    },
    {
      name: 'DKIM-Signature',
      value: 'v=1; a=rsa-sha256; c=relaxed/relaxed;        d=gmail.com; s=20230601; t=1698696637; x=1699301437; dara=google.com;        h=to:subject:message-id:date:from:mime-version:from:to:cc:subject         :date:message-id:reply-to;        bh=aLIh+WCg9J8NyrxMmzl2FoXIzZbAFd/v9gG9TVjJT3U=;        b=OP0htxsRT34XPGNYRriTgYpkUNO9HVmB/msBHkehAf7P26FmSVfyRWpxUM7lgU6wXN         2zS3tWhjFO/ZFaT4u+l/JHR2e1i7lHiCnci84op77hHBiAF96j7bL89Iao48zKlX+W8k         jSee0wfjBkhq/JUw8n265RdJ9NLvEbXbMHr+JyVcbH4JEIj5xBrfIk/NKUvBe4ZU+r2x         przDGY3JSmYrHsp8o5GQZFQ8zzTrKTKlIhtV/B2s/6SuZGQYR38wm9pX01yaO2sFK3KS         MgbABx63lcb/RdaLcc4nM+aDofUwQzEnN4k62DSYskAJ6tAmXjEIiwShCo5vUo+PVTOI         7pFA=='
    },
    {
      name: 'X-Google-DKIM-Signature',
      value: 'v=1; a=rsa-sha256; c=relaxed/relaxed;        d=1e100.net; s=20230601; t=1698696637; x=1699301437;        h=to:subject:message-id:date:from:mime-version:x-gm-message-state         :from:to:cc:subject:date:message-id:reply-to;        bh=aLIh+WCg9J8NyrxMmzl2FoXIzZbAFd/v9gG9TVjJT3U=;        b=Dx9mvxT0zDMKJkO9HORmGQqL1rhkXrckhta4F46WcZbmUuV6mou/gZfi0RABNkWrbb         7nmwAJD7Hw9aVbRgMUYh9Ky2PV8KRpOiM33Fou0xLj2tH/1A+YCsasqq660UrtL1de5i         XGW3VsrQycmYDa6XIDdLb8Zh0oPzzLlHoOQDyNeuZGX/h8amX8qGEZg5XFs4KgJ4IPHQ         fnHb10uJaq9bR6C9cSw5GYiVAaJijQwfv2f0vabBP3GjNo8v7tvLeQPAxsgQRMVpdXQM         j2Cj64K4xGNOHCx0uRcqUjJqHM6n2lG8bpLcXBbn01Jzaqm/FYRpfJVyerTvcE48/cVj         10ow=='
    },
    {
      name: 'X-Gm-Message-State',
      value: 'AOJu0Yy3GCYNaT0zlXi3xXihOGLiYPTZHIj6hflTzWv9b8WvWNZYTz9T cFqOeBAibk+1w3D6ByvOr2M88FHL1j64iOzP1p2mQvVZvEQ='
    },
    {
      name: 'X-Google-Smtp-Source',
      value: 'AGHT+IFuftHRIHEnGS+Eu2TDzO2Gx3iaP48aY/xeNLK4AEkVqIFanq24I1NEEDNCg5X6g7vndZ6kxg+YcFSEYSD2p8Q='
    },
    {
      name: 'X-Received',
      value: 'by 2002:a05:6512:3f0f:b0:509:b45:8879 with SMTP id y15-20020a0565123f0f00b005090b458879mr5886842lfa.3.1698696636962; Mon, 30 Oct 2023 13:10:36 -0700 (PDT)'
    },
    { name: 'MIME-Version', value: '1.0' },
    { name: 'From', value: 'eesah saeed <eesahsaeed@gmail.com>' },
    { name: 'Date', value: 'Mon, 30 Oct 2023 21:10:25 +0100' },
    {
      name: 'Message-ID',
      value: '<CA+=edswCD-Q3BaSnsAmH3407=TctBFTp6zy6hhpwha=KDPm0pA@mail.gmail.com>'
    },
    { name: 'Subject', value: 'Hello' },
    { name: 'To', value: 'Isah 308 <isahsaidu308@gmail.com>' },
    {
      name: 'Content-Type',
      value: 'multipart/alternative; boundary="000000000000a09e4b0608f4a1e6"'
    }
  ],
  body: "Hello World"
};