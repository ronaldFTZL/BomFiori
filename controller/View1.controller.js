sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"ZFiori/ZFCIApp/model/models",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/export/Spreadsheet",
	"sap/m/Token"
], function (Controller, Models, Filter, FilterOperator, JSONModel, MessageToast, MessageBox, Spreadsheet, Token) {

	return Controller.extend("ZFiori.ZFCIApp.controller.View1", {

		onInit: function () {
			this.byId("multiInput").setFilterFunction(function (sTerm, oItem) {
				return oItem.getKey().match(sTerm);
			});
		},

		onFilter: function () {
			var oMateriaisModel = this.getView().getModel("Materiais"),
				aMateriais = oMateriaisModel.getProperty("/Tokens"),
				// .map(function (material) {
				// 	return material.getProperty("key");
				// }),

				centro = this.byId("cbCentro").getSelectedItem().getText(),
				isMaterialNovo = this.byId("cbMaterialNovo").getSelected(),
				somenteExibir = this.byId("cbSomenteExibir").getSelected(),
				periodo = this.byId("inptPeriodo").getValue(),
				oView = this.getView(),
				oModel = oView.getModel();

			if (!this.verificaCamposPreenchidos(aMateriais, centro, somenteExibir, periodo)) {
				return;
			}

			oView.setBusy(true);

			oModel.read("/FichaControleSet", {
				filters: this.montaFiltros(aMateriais, centro, isMaterialNovo, periodo),
				success: function (oData) {
					oMateriaisModel.setProperty("/Materiais", oData.results);
					oView.setBusy(false);
					this.byId("btnExportar").setEnabled(true);
					this.byId("btnRegistrar").setEnabled(!somenteExibir);
				}.bind(this),
				error: function (oErr) {
					this.byId("btnRegistrar").setEnabled(false);
					this.byId("btnExportar").setEnabled(false);
					var json = new JSONModel();
					json.setData([]);
					oView.setModel(json, "Materiais");
					oView.setBusy(false);
					try {
						var err = JSON.parse(oErr.responseText);
						MessageBox.error(err.error.message.value);
					} catch (exception) {
						MessageBox.error("Erro não mapeado");
					}
				}.bind(this)
			});
		},

		updateToken: function (oEvent) {
			var mData = oEvent.getParameters(),
				oModel = this.getView().getModel("Materiais"),
				aTokens = oModel.getProperty("/Tokens") || [];

			aTokens = aTokens.filter(function (token) {
				return mData.removedTokens.indexOf(token) !== -1;
			});
			aTokens = aTokens.concat(mData.addedTokens.filter(function (token) {
				return aTokens.indexOf(token.getKey()) === -1;
			}).map(function (token) {
				return token.getKey();
			}));
			oModel.setProperty("/Tokens", aTokens);
		},

		verificaCamposPreenchidos: function (material, centro, somenteExibir, periodo) {
			if (!material) {
				MessageBox.error("Preencha o campo Material");
				return false;
			}
			if (!centro) {
				MessageBox.error("Preencha o campo Centro");
				return false;
			}
			if (somenteExibir && !periodo) {
				MessageBox.error("Preencha o campo Período de Exibição");
				return false;
			}
			return true;
		},

		montaFiltros: function (material, centro, isMaterialNovo, periodo) {
			return [
				new Filter({
					and: false,
					filters: material.map(function (valor) {
						return new Filter("Material", FilterOperator.EQ, valor);
					})
				}),
				new Filter("Centro", FilterOperator.EQ, centro),
				new Filter("MaterialNovo", FilterOperator.EQ, isMaterialNovo.toString()),
				new Filter("Periodo", FilterOperator.EQ, periodo)
			];
		},

		onSelect: function (oEvent) {
			var oView = this.getView(),
				bSelected = oEvent.getParameter("selected");
			oView.byId("formPeriodo").setVisible(bSelected);
			oView.byId("inptPeriodo").setValue("");
		},

		getLogKeys: function () {
			var oModel = this.getView().getModel(),
				mMetadata = oModel.getServiceMetadata(),
				mSchema = mMetadata.dataServices.schema.find(function (schema) {
					return schema.namespace === "ZMM_FCI_REPORT_SRV";
				}),
				mLogFCI = mSchema.entityType.find(function (entityType) {
					return entityType.name === "LogFCI";
				});

			return mLogFCI.property.map(function (property) {
				return property.name;
			});
		},

		onSave: function () {
			var oView = this.getView(),
				oModel = oView.getModel(),
				oMateriaisModel = oView.getModel("Materiais"),
				aLogKeys = this.getLogKeys(),
				aContexts = this.byId("dadosMateriais").getItems().map(function (oItem) {
					var mContext = oMateriaisModel.getProperty(oItem.getBindingContextPath());
					Object.keys(mContext).forEach(function (key) {
						if (aLogKeys.indexOf(key) === -1) {
							delete mContext[key];
						}
					});
					return mContext;
				}),
				sGroupId = "LogFCI" + Date.now();

			MessageBox.warning("Registrar os dados processados?", {
				actions: [MessageBox.Action.YES, MessageBox.Action.CANCEL],
				onClose: function (sAction) {
					if (sAction === "YES") {
						aContexts.forEach(function (mContext) {
							oModel.create("/LogFCISet", mContext, {
								groupId: sGroupId
							});
						});
						oModel.submitChanges({
							groupId: sGroupId,
							success: function (oData) {
								MessageToast.show("Dados atualizados com sucesso!");
							},
							error: function () {
								MessageToast.show("Ocorreram erros ao tentar atualizar as informações. Tente novamente mais tarde!");
							}
						});
					}
				}
			});
		},

		onExport: function () {
			var oView = this.getView(),
				oMateriais = oView.getModel("Materiais");

			MessageBox.warning("Deseja exportar os dados em planilha?", {
				actions: [MessageBox.Action.YES, MessageBox.Action.CANCEL],
				onClose: function (sAction) {
					if (sAction === "YES") {
						oView.setBusy(true);
						var oSettings = {
							workbook: {
								columns: Models.createColumnConfig(),
								dataSource: oMateriais.getProperty("/Materiais")
							}
						};
						new Spreadsheet(oSettings)
							.build()
							.then(function () {
								MessageToast.show("Planilha exportada");
								oView.setBusy(false);
							});
					}
				}
			});
		}

	});
});