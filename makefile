.PHONY: site
site: mkdocs.yml
	mkdocs build --clean

.PHONY: dependence
dependence:
	pip install mkdocs
	pip install mkdocs-material
	pip install mkdocs-git-revision-date-localized-plugin
	pip install pillow cairosvg
