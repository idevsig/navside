#!/usr/bin/env bash

# https://github.com/idevsig/navsites/blob/main/.deploy.sh

set -euo pipefail

IN_CHINA=""

COMMIT_MSG="" # 提交信息
PUBLISH_DIR=""  # 发布目录
PROJECT_NAME="" # 项目名称
GIT_BRANCH_NAME="${CI_COMMIT_BRANCH:-$(git rev-parse --abbrev-ref HEAD)}" # 分支名称

DEPLOY=""      # 部署

readonly ICON_DIR="static/assets/images/logos"
readonly WEBSTACK_FILE="./data/webstack.yml"
readonly SYNC_FILE=".sync.txt"

check_command() {
    command -v "$1" >/dev/null 2>&1
}

check_in_china() {
    if [ "$(curl -s -m 3 -o /dev/null -w "%{http_code}" https://www.google.com)" != "200" ]; then
        IN_CHINA=1
    fi
}

# 处理参数信息
judgment_parameters() {
    while [[ "$#" -gt '0' ]]; do
        case "$1" in
            '-d' | '--deploy') # 部署
                DEPLOY="true"
                ;;
            '-p' | '--publish') # 部署目录
                shift
                PUBLISH_DIR="${1:?"error: Please specify the correct publish directory."}"
                ;;
            '-g' | '--git')
                shift
                COMMIT_MSG="${1:?"error: Please specify the correct commit message."}"
                ;;
            '-h' | '--help')
                show_help
                ;;
            *)
                echo "$0: unknown option -- $1" >&2
                exit 1
                ;;
        esac
        shift
    done
}

# 显示帮助信息
show_help() {
    cat <<EOF
usage: $0 [ options ]

  -h, --help                           print help
  -d, --deploy                         deploy
  -p, --publish <publish>              set publish directory
  -g, --git <git>                      set commit message
EOF
    exit 0
}

# 获取发布目录
get_publish_dir() {
  PUBLISH_DIR="$(grep publishDir config.toml | awk -F '\"' '{print $2}')" # static files
}

# 获取项目名称
get_project_name() {
  if [ "$GIT_BRANCH_NAME" = "main" ]; then   # 精选
    PROJECT_NAME="nav"
  elif [ "$GIT_BRANCH_NAME" = "more" ]; then # 全量 
    PROJECT_NAME="navs"
  fi 
}

# more 分支处理
action_for_more_bracnch() {
  # 拉取 main 分支文件
  git checkout main -- .gitignore .gitlab-ci.yml README.md .deploy.sh config.toml data/friendlinks.yml data/headers.yml

  # update config.toml
  sed -i 's#精选导航#全量导航#g' config.toml
  sed -i 's#nav.idev.top#navs.idev.top#g' config.toml

  # update data/headers.yml
  sed -i 's#全量#精选#g' data/headers.yml
  sed -i 's#navs.idev.top#nav.idev.top#g' data/headers.yml    
}

# 检测参数是否正确
check_parameters() {
  if [ -z "${PUBLISH_DIR:-}" ]; then
    echo "error: publish directory cannot be empty."
    exit 1
  fi
}

# git push
git_commit_and_push() {
  if [ -n "${COMMIT_MSG:-}" ]; then
    git add .
    git commit -am "feat: $COMMIT_MSG"
    git push origin "$GIT_BRANCH_NAME"  
  fi
}

# 部署到 Cloudflare
deploy_to_cloudflare() {
  if [ -n "${DEPLOY:-}" ]; then
    if [ -n "${PROJECT_NAME:-}" ]; then
      echo -e "no\n" | wrangler pages deploy "$PUBLISH_DIR" \
        --project-name "$PROJECT_NAME" \
        --branch main  
    fi
  fi
}

# 同步图片逻辑
sync_images() {
    if [ "$GIT_BRANCH_NAME" = "more" ]; then
        # 从 main 分支同步图片
        while IFS= read -r image; do
            echo -e "Syncing from main: $image"
            git checkout main -- "$image"
        done < <(tail -n+2 "$SYNC_FILE")
    elif [ "$GIT_BRANCH_NAME" = "main" ]; then
        # 记录需要同步的图片到 .sync.txt
        echo "# sync logos images" > "$SYNC_FILE"
        while IFS= read -r image; do
            local filename=${image##*/}
            local filepath="$ICON_DIR/$filename"
            if [ -f "$filepath" ]; then
                echo -e "Recording for sync: $filename"
                echo "$filepath" >> "$SYNC_FILE"
            fi
        done < <(git status --porcelain | grep logos)
    fi
}

# 提取域名部分
extract_domain() {
  local url=$1
  local domain_part
  local protocol
  local domain

  # # 使用正则表达式提取域名部分
  # if [[ $url =~ ^[^/]*//([^/?]+)(/|$) ]]; then
  #   domain_part="${BASH_REMATCH[1]}"
  # fi

  # 提取协议和域名部分（去掉路径和参数）
  if [[ $url =~ ^(https?)://([^/?#]+) ]]; then
      protocol="${BASH_REMATCH[1]}"  # 提取协议 http 或 https
      domain="${BASH_REMATCH[2]}"    # 提取域名
      domain_part="${protocol}://${domain}"
  else
      # 如果 URL 不带协议，默认添加 https://
      domain_part="https://${url%%/*}"
  fi

  # 移除 www. 前缀（如果存在）
  # domain_part="${domain_part#www.}"

  echo "$domain_part"
}

# 从 Google 获取图标
get_icon_from_google() {
  local url=$1
  local domain_part

  if [ -z "$url" ]; then
    return
  fi

  domain_part=$(extract_domain "$url")
  url="${domain_part//:\/\//%3A%2F%2F}"
  url=$(printf "https://t3.gstatic.cn/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=%s&size=48" "$url")

  echo "$url"
}

# 处理图标
process_icons() {
  logo="${1:-}"
  url="${2:-}"
  favicon_url="${3:-}"

  if [ -z "$logo" ]; then
    return
  fi

  # 生成文件名
  local cleaned_name
  cleaned_name=$(echo "$logo" | tr -d '[:space:]')
  local filepath="$ICON_DIR/$cleaned_name"  

  if [ ! -f "public/$filepath" ] && [ ! -f "$filepath" ]; then
    if [ -z "$favicon_url" ]; then
      favicon_url=$(get_icon_from_google "$url")
    fi

    if [ -z "$favicon_url" ]; then
      return
    fi

    printf "Downloading logo: \n  %-40s => %s\n" "$favicon_url" "$cleaned_name"
    if ! curl -fsL -o "$filepath" "$favicon_url"; then
      echo -e "\033[33mWarning: favicon $logo skipped...\033[0m"
    fi
  fi
}

# 处理 webstack.yml
process_webstack() {
  declare -A current_block
  in_block=0

  # 逐行读取文件
  while IFS= read -r line; do
      # 检测是否以 "- title:" 开头
      if [[ "$line" =~ ^[[:space:]]*-[[:space:]]*title: ]]; then
          # 如果已经在处理一个块，则输出当前块的 logo、url 和 favicon
          if [[ $in_block -eq 1 ]]; then
              # echo "Logo: ${current_block[logo]:-N/A}"
              # echo "URL: ${current_block[url]:-N/A}"
              # echo "Favicon: ${current_block[favicon]:-N/A}"
              # echo "-------------------"
              process_icons "${current_block[logo]:-}" "${current_block[url]:-}" "${current_block[favicon]:-}"
          fi
          # 重置当前块
          current_block=()
          in_block=1
      fi

      # 提取 logo、url 和 favicon 字段
      if [[ $in_block -eq 1 ]]; then
          if [[ "$line" =~ ^[[:space:]]*logo:[[:space:]]*(.*) ]]; then
              current_block[logo]=${BASH_REMATCH[1]}
          elif [[ "$line" =~ ^[[:space:]]*url:[[:space:]]*\"?(.*[^[:space:]])\"? ]]; then
              current_block[url]=${BASH_REMATCH[1]}
          elif [[ "$line" =~ ^[[:space:]]*favicon:[[:space:]]*(.*) ]]; then
              current_block[favicon]=${BASH_REMATCH[1]}
          fi
      fi
  done < "$WEBSTACK_FILE"

  # 输出最后一个块的 logo、url 和 favicon
  if [[ $in_block -eq 1 ]]; then
      # echo "Logo: ${current_block[logo]:-N/A}"
      # echo "URL: ${current_block[url]:-N/A}"
      # echo "Favicon: ${current_block[favicon]:-N/A}"
      # echo "-------------------"
      process_icons "${current_block[logo]:-}" "${current_block[url]:-}" "${current_block[favicon]:-}"
  fi

  echo
}

fetch_icons() {
  if [ ! -d "$ICON_DIR" ]; then
    mkdir -p "$ICON_DIR"
  fi
  
  process_webstack

  sync_images
}

main() {
  get_publish_dir
  get_project_name

  judgment_parameters "$@"

  check_parameters

  if [ "$GIT_BRANCH_NAME" = "more" ]; then
    action_for_more_bracnch
  fi

  # remove hugo old data
  rm -rf "$PUBLISH_DIR"  

  echo
  echo "DEPLOY: $DEPLOY"
  echo "PUBLISH_DIR: $PUBLISH_DIR"
  echo "PROJECT_NAME: $PROJECT_NAME"
  echo "COMMIT_MSG: $COMMIT_MSG"
  echo "GIT_BRANCH_NAME: $GIT_BRANCH_NAME"
  echo

  # hugo gen data
  hugo --minify

  if [ ! -d "$PUBLISH_DIR" ]; then
      echo -e "\033[31mpublishDir $PUBLISH_DIR not found\033[0m"
      exit 1
  fi    

  # check_in_china

  fetch_icons

  git_commit_and_push

  deploy_to_cloudflare
}

main "$@"
