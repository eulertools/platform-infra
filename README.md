# platform-infra

Shared VPC / DNS / Lambda-layer CDK. Archived snapshot, as-is.

This tree is a **new public commit** with no git history. The original private archive is `eulertools/platform-infra-archive`.

Generated `cdk.context.json` (AZs per AWS account) was **removed**.

No contract deployments recorded in this repo.

## What was built (EN)

platform-infra is the foundational AWS CDK infrastructure project that provisions shared cloud resources consumed by all other platform services. `DevopsAccountInfrastructureStack` creates a VPC, Route 53 DNS, S3 artifact buckets, and SSM parameters. `LambdaLayerStack` builds shared layers (dynamodb, axios, http-utils, opensearch, s3-utils, web3).

## Qué se construyó (ES)

Infraestructura CDK compartida (VPC, DNS, layers). Contexto CDK de AWS eliminado.

---

## Notice / Aviso

**Euler Tools ha cerrado. Euler Tools is closed.**

La empresa quebró. Este repositorio está archivado y no se mantiene. El software se ofrece tal cual (as is), sin garantía ni soporte. Parte del material puede ser reclamado por acreedores.

The company went bankrupt. This repository is archived and unmaintained. Software is provided as is, with no warranty and no support. Some material may be claimed by creditors.

Site: https://euler.tools  
Org: https://github.com/eulertools  
Enquiries: https://sinequix.com · https://github.com/tebayoso
