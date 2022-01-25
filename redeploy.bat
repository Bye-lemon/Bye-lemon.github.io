@echo off

if exist .deploy_git\ (
    hexo clean&&hexo g&&rmdir /s/q .deploy_git&&hexo d
) else (
    hexo clean&&hexo g&&hexo d
)